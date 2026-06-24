import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getLikedPosts, getFavoritePosts } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme/colors';
import { Post, RootStackParamList } from '../../types';
import { postAuthorName } from '../../utils/authorNames';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LikedSaved'>;
  route: RouteProp<RootStackParamList, 'LikedSaved'>;
};

type TabKey = 'liked' | 'saved';

export default function LikedSavedScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>(route.params?.initialTab ?? 'liked');
  const [liked, setLiked] = useState<Post[]>([]);
  const [saved, setSaved] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setError('');
    try {
      const [likeRes, favRes] = await Promise.all([
        getLikedPosts(user._id),
        getFavoritePosts(user._id),
      ]);
      setLiked(likeRes.posts);
      setSaved(favRes.posts);
    } catch (err: any) {
      setError(err.message || 'İçerik yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const data = tab === 'liked' ? liked : saved;

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PostDetail', { postId: item._id, post: item })}
      activeOpacity={0.85}
    >
      <View style={styles.cardMeta}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleDateString('tr-TR')}
        </Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={2}>
        {item.content?.replace(/<[^>]+>/g, '') || ''}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.authorName}>{postAuthorName(item)}</Text>
        <View style={styles.statsRow}>
          <Ionicons name="heart-outline" size={14} color={Colors.muted} />
          <Text style={styles.statText}>{item.likeCount ?? item.likes ?? 0}</Text>
          <Ionicons name="bookmark-outline" size={14} color={Colors.muted} style={{ marginLeft: 8 }} />
          <Text style={styles.statText}>{item.favoriteCount ?? item.favorites ?? 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'liked' && styles.tabActive]}
          onPress={() => setTab('liked')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={tab === 'liked' ? 'heart' : 'heart-outline'}
            size={18}
            color={tab === 'liked' ? Colors.error : Colors.muted}
          />
          <Text style={[styles.tabText, tab === 'liked' && styles.tabTextActive]}>
            Beğendiklerim ({liked.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'saved' && styles.tabActive]}
          onPress={() => setTab('saved')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={tab === 'saved' ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={tab === 'saved' ? Colors.warning : Colors.muted}
          />
          <Text style={[styles.tabText, tab === 'saved' && styles.tabTextActive]}>
            Kaydettiklerim ({saved.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.white}
            colors={[Colors.white]}
            progressBackgroundColor={Colors.bgCard}
          />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={Colors.white} style={{ marginTop: 60 }} />
          ) : error ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
                <Text style={styles.retryText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name={tab === 'liked' ? 'heart-outline' : 'bookmark-outline'}
                size={48}
                color={Colors.muted}
              />
              <Text style={styles.emptyText}>
                {tab === 'liked' ? 'Henüz beğendiğin yazı yok' : 'Henüz kaydettiğin yazı yok'}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  tabActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}20` },
  tabText: { fontSize: 13, color: Colors.muted, fontWeight: '500' },
  tabTextActive: { color: Colors.text, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  categoryBadge: {
    backgroundColor: `${Colors.primary}25`,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: { fontSize: 12, color: Colors.primaryLight, fontWeight: '600' },
  cardDate: { fontSize: 12, color: Colors.muted },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  cardContent: { fontSize: 14, color: Colors.muted, lineHeight: 20, marginBottom: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorName: { fontSize: 13, color: Colors.muted },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: Colors.muted },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: Colors.muted, fontSize: 15 },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: Colors.white, fontWeight: '600' },
});
