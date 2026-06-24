import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUser, deleteUser } from '../../api/users';
import { deletePost } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { Post, RootStackParamList } from '../../types';
import { getLocalPostsByAuthor, removeLocalPost, mergePostsById } from '../../utils/localPosts';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setError('');
    // Yerelde saklanan kendi yazıları (backend erişilemese de görünsün).
    const local = await getLocalPostsByAuthor(user._id);
    try {
      const data = await getUser(user._id);
      // Backend yazıları öncelikli; yerel-yalnız yazılar da eklenir (tekilleştirilmiş).
      setPosts(mergePostsById(data.posts ?? [], local));
    } catch (err: any) {
      // Backend erişilemiyor: en azından yerel yazıları göster.
      setPosts(local);
      if (local.length === 0) setError(err.message || 'Profil yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // Sekmeye her dönüldüğünde yenile — yeni yazılan yazılar anında görünsün.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { loadProfile(); });
    return unsubscribe;
  }, [navigation, loadProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz silinir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Son Onay',
      'Tüm yazılarınız ve yorumlarınız kalıcı olarak silinecektir. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabımı Sil',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await deleteUser(user._id);
              await signOut();
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Hesap silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleDeletePost = (postId: string) => {
    if (!user) return;
    Alert.alert('Yazıyı Sil', 'Bu yazıyı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(postId, user._id);
          } catch {
            // Backend erişilemese de yerel kopyayı ve listeyi güncellemeye devam et.
          }
          await removeLocalPost(postId);
          setPosts((p) => p.filter((x) => x._id !== postId));
        },
      },
    ]);
  };

  if (!user) return null;

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} colors={[Colors.white]} />}
    >
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{fullName}</Text>
        {user.username && <Text style={styles.username}>{user.username}</Text>}
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

        <View style={styles.metaRow}>
          {user.email && (
            <View style={styles.metaItem}>
              <Ionicons name="mail-outline" size={14} color={Colors.muted} />
              <Text style={styles.metaText}>{user.email}</Text>
            </View>
          )}
          {user.profession && (
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={14} color={Colors.muted} />
              <Text style={styles.metaText}>{user.profession}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={Colors.muted} />
            <Text style={styles.metaText}>
              {new Date(user.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} katıldı
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={16} color={Colors.white} />
            <Text style={styles.editBtnText}>Profili Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={16} color={Colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('LikedSaved', { initialTab: 'liked' })}
          activeOpacity={0.85}
        >
          <Ionicons name="heart" size={20} color={Colors.error} />
          <Text style={styles.quickLinkText}>Beğendiklerim</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('LikedSaved', { initialTab: 'saved' })}
          activeOpacity={0.85}
        >
          <Ionicons name="bookmark" size={20} color={Colors.warning} />
          <Text style={styles.quickLinkText}>Kaydettiklerim</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>Yazılarım ({posts.length})</Text>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} />
        ) : error ? (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadProfile()}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color={Colors.muted} />
            <Text style={styles.emptyText}>Henüz bir şey yazmadınız</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post._id} style={styles.postCard}>
              <View style={styles.postCardHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{post.category}</Text>
                </View>
                <View style={styles.postActions}>
                  <Text style={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeletePost(post._id)} style={styles.trashBtn}>
                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
              <Text style={styles.postPreview} numberOfLines={2}>
                {post.content?.replace(/<[^>]+>/g, '') || ''}
              </Text>
              <View style={styles.postStats}>
                <Ionicons name="heart-outline" size={14} color={Colors.muted} />
                <Text style={styles.statText}>{post.likeCount ?? post.likes ?? 0}</Text>
                <Ionicons name="bookmark-outline" size={14} color={Colors.muted} />
                <Text style={styles.statText}>{post.favoriteCount ?? post.favorites ?? 0}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.deleteAccountBtn} onPress={handleDeleteAccount} activeOpacity={0.8}>
        <Ionicons name="warning-outline" size={16} color={Colors.error} />
        <Text style={styles.deleteAccountText}>Hesabı Kalıcı Olarak Sil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  scroll: { paddingBottom: 100 },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  avatarText: { color: Colors.white, fontSize: 30, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text },
  username: { fontSize: 15, color: Colors.primaryLight, marginTop: 2 },
  bio: { fontSize: 14, color: Colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  metaRow: { gap: 6, marginTop: 12, alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: Colors.muted },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.bgCard,
  },
  quickLinks: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  quickLinkText: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  postsSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  postCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: `${Colors.primary}25`,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: { fontSize: 11, color: Colors.primaryLight, fontWeight: '600' },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postDate: { fontSize: 12, color: Colors.muted },
  trashBtn: { padding: 2 },
  postTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  postPreview: { fontSize: 13, color: Colors.muted, lineHeight: 18, marginBottom: 10 },
  postStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 12, color: Colors.muted, marginRight: 4 },
  errorState: { alignItems: 'center', paddingTop: 30, gap: 10 },
  errorText: { color: Colors.error, fontSize: 14 },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: Colors.white, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 30, gap: 10 },
  emptyText: { color: Colors.muted, fontSize: 14 },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 20,
    marginTop: 0,
    borderWidth: 1,
    borderColor: `${Colors.error}40`,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: `${Colors.error}10`,
  },
  deleteAccountText: { color: Colors.error, fontSize: 14, fontWeight: '600' },
});
