import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getComments, addComment, deleteComment } from '../../api/comments';
import { deletePost, reactToPost } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { Comment, Post, RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PostDetail'>;
  route: RouteProp<RootStackParamList, 'PostDetail'>;
};

export default function PostDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { post } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [likes, setLikes] = useState(post?.likeCount ?? post?.likes ?? 0);
  const [favorites, setFavorites] = useState(post?.favoriteCount ?? post?.favorites ?? 0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    if (!post) return;
    try {
      const { comments: data } = await getComments(post._id);
      setComments(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !post) return;
    try {
      await reactToPost(post._id, user._id, 'like');
      setLiked((v) => !v);
      setLikes((v) => (liked ? v - 1 : v + 1));
    } catch { /* ignore */ }
  };

  const handleFavorite = async () => {
    if (!user || !post) return;
    try {
      await reactToPost(post._id, user._id, 'favorite');
      setFavorited((v) => !v);
      setFavorites((v) => (favorited ? v - 1 : v + 1));
    } catch { /* ignore */ }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user || !post) return;
    setSubmitting(true);
    try {
      const newComment = await addComment(post._id, user._id, commentText.trim());
      setComments((c) => [newComment, ...c]);
      setCommentText('');
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Yorum eklenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!user) return;
    Alert.alert('Yorumu Sil', 'Bu yorumu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteComment(commentId, user._id);
            setComments((c) => c.filter((x) => x._id !== commentId));
          } catch (err: any) {
            Alert.alert('Hata', err.message);
          }
        },
      },
    ]);
  };

  const handleDeletePost = () => {
    if (!user || !post) return;
    Alert.alert('Yazıyı Sil', 'Bu yazıyı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post._id, user._id);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Hata', err.message);
          }
        },
      },
    ]);
  };

  const authorObj = typeof post?.authorId === 'object' ? post?.authorId : null;
  const authorName = authorObj
    ? `${authorObj.firstName} ${authorObj.lastName}`
    : 'Yazar';
  const isOwner = user && authorObj && authorObj._id === user._id;

  const commentAuthorName = (c: Comment) => {
    if (typeof c.authorId === 'object' && c.authorId !== null) {
      return `${c.authorId.firstName} ${c.authorId.lastName}`;
    }
    return 'Kullanıcı';
  };
  const isCommentOwner = (c: Comment) => {
    if (typeof c.authorId === 'object' && c.authorId !== null) {
      return c.authorId._id === user?._id;
    }
    return c.authorId === user?._id;
  };

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorMsg}>Yazı bulunamadı</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>
          {isOwner && (
            <TouchableOpacity onPress={handleDeletePost} style={styles.deletePostBtn}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
              <Text style={styles.deletePostText}>Sil</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title}>{post.title}</Text>

        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{authorName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.postDate}>
              {new Date(post.createdAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {post.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.content}>{post.content?.replace(/<[^>]+>/g, '') || ''}</Text>

        <View style={styles.reactRow}>
          <TouchableOpacity style={styles.reactBtn} onPress={handleLike}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? Colors.error : Colors.muted}
            />
            <Text style={[styles.reactCount, liked && { color: Colors.error }]}>{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactBtn} onPress={handleFavorite}>
            <Ionicons
              name={favorited ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={favorited ? Colors.warning : Colors.muted}
            />
            <Text style={[styles.reactCount, favorited && { color: Colors.warning }]}>{favorites}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Yorumlar ({comments.length})</Text>

          {user && (
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Yorum ekleyin..."
                placeholderTextColor={Colors.muted}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!commentText.trim() || submitting) && styles.sendBtnDisabled]}
                onPress={handleAddComment}
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="send" size={18} color={Colors.white} />
                )}
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
          ) : comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>Henüz yorum yok. İlk yorumu sen yap!</Text>
            </View>
          ) : (
            comments.map((c) => (
              <View key={c._id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAuthorRow}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {commentAuthorName(c).charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.commentAuthor}>{commentAuthorName(c)}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                  </View>
                  {isCommentOwner(c) && (
                    <TouchableOpacity onPress={() => handleDeleteComment(c._id)}>
                      <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentContent}>{c.content}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgPage },
  errorMsg: { color: Colors.error },
  scroll: { padding: 20, paddingBottom: 40 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  categoryBadge: {
    backgroundColor: `${Colors.primary}25`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: { fontSize: 12, color: Colors.primaryLight, fontWeight: '600' },
  deletePostBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deletePostText: { color: Colors.error, fontSize: 13 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, lineHeight: 32, marginBottom: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  authorName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  postDate: { fontSize: 13, color: Colors.muted },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { fontSize: 12, color: Colors.muted },
  content: { fontSize: 16, color: Colors.text, lineHeight: 26, marginBottom: 24 },
  reactRow: { flexDirection: 'row', gap: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  reactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reactCount: { fontSize: 15, color: Colors.muted },
  commentsSection: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  commentInputRow: { flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'flex-end' },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  emptyComments: { paddingVertical: 24, alignItems: 'center' },
  emptyCommentsText: { color: Colors.muted, fontSize: 14 },
  commentCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  commentAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.skyBottom,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  commentAuthor: { fontSize: 14, fontWeight: '600', color: Colors.text },
  commentDate: { fontSize: 12, color: Colors.muted },
  commentContent: { fontSize: 14, color: Colors.text, lineHeight: 20 },
});
