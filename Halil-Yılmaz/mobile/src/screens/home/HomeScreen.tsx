import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPosts } from '../../api/posts';
import { Post, RootStackParamList } from '../../types';
import { Colors } from '../../theme/colors';
import { postAuthorName } from '../../utils/authorNames';
import { SAMPLE_POSTS } from '../../data/samplePosts';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

const CATEGORIES = [
  { label: 'Tümü', topic: '' },
  { label: 'Yapay Zeka', topic: 'yapay-zeka' },
  { label: 'Yazılım', topic: 'yazilim' },
  { label: 'Mobil', topic: 'mobil' },
  { label: 'Bulut', topic: 'bulut' },
  { label: 'Siber Güvenlik', topic: 'siber-guvenlik' },
  { label: 'Veri Bilimi', topic: 'veri-bilimi' },
  { label: 'Blockchain', topic: 'blockchain' },
  { label: 'DevOps', topic: 'devops' },
  { label: 'Veritabanı', topic: 'veritabani' },
  { label: 'Robotik', topic: 'robotik' },
];

const SORTS: { key: 'recent' | 'popular' | 'oldest'; label: string }[] = [
  { key: 'recent', label: 'Yeni' },
  { key: 'popular', label: 'Popüler' },
  { key: 'oldest', label: 'Eski' },
];

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Post>>(null);
  const lastTabPress = useRef(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<'recent' | 'popular' | 'oldest'>('recent');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Fisher–Yates karıştırma — her yenilemede farklı öneriler üste gelsin.
  const shuffle = (arr: Post[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Backend boş/erişilemez olduğunda örnek yazıları seçili kategori ve aramaya göre süz.
  const filteredSamples = useCallback(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_POSTS.filter((p) => {
      const catOk = !category.label || category.label === 'Tümü' || p.category === category.label;
      if (!catOk) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.content} ${(p.tags ?? []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [category, search]);

  const fetchPosts = useCallback(
    async (opts?: { shuffle?: boolean }) => {
      setError('');
      try {
        const params: any = { sort };
        if (category.topic) params.topic = category.topic;
        if (search.trim()) params.q = search.trim();
        const { posts: data } = await getPosts(params);
        // Backend hiç yazı dönmediyse akış boş kalmasın: örnek yazıları göster.
        const result = data && data.length ? data : filteredSamples();
        setPosts(opts?.shuffle ? shuffle(result) : result);
      } catch (err: any) {
        // Backend erişilemiyor: akışı boş bırakma, örnek yazılara düş.
        const fallback = filteredSamples();
        setPosts(opts?.shuffle ? shuffle(fallback) : fallback);
      }
    },
    [sort, category, search, filteredSamples]
  );

  useEffect(() => {
    setLoading(true);
    fetchPosts().finally(() => setLoading(false));
  }, [fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Yenilemede farklı/yeni öneriler getir.
    await fetchPosts({ shuffle: true });
    setRefreshing(false);
  }, [fetchPosts]);

  // Keşfet sekmesi ikonuna 300ms içinde iki kez basılırsa listeyi başa al ve yenile.
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      const now = Date.now();
      if (now - lastTabPress.current < 300) {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
        onRefresh();
      }
      lastTabPress.current = now;
    });
    return unsubscribe;
  }, [navigation, onRefresh]);

  const authorName = (post: Post) => postAuthorName(post);

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
      <Text style={styles.cardContent} numberOfLines={3}>
        {item.content?.replace(/<[^>]+>/g, '') || ''}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.authorRow}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>
              {authorName(item).charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.authorName}>{authorName(item)}</Text>
        </View>
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
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.appName}>BlogicodeAI</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Yazı ara..."
          placeholderTextColor={Colors.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={posts}
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
        ListHeaderComponent={
          <View>
            <FlatList
              horizontal
              data={SORTS}
              keyExtractor={(i) => i.key}
              showsHorizontalScrollIndicator={false}
              style={styles.filterRow}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.filterChip, sort === item.key && styles.filterChipActive]}
                  onPress={() => setSort(item.key)}
                >
                  <Text style={[styles.filterChipText, sort === item.key && styles.filterChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={(i) => i.label}
              showsHorizontalScrollIndicator={false}
              style={[styles.filterRow, { marginTop: 0 }]}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.filterChip, category.label === item.label && styles.filterChipActive]}
                  onPress={() => setCategory(item)}
                >
                  <Text style={[styles.filterChipText, category.label === item.label && styles.filterChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={Colors.white} style={{ marginTop: 60 }} />
          ) : error ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => fetchPosts()}>
                <Text style={styles.retryText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>Henüz yazı yok</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: { fontSize: 22, fontWeight: '700', color: Colors.primaryLight },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 12, color: Colors.text, fontSize: 15 },
  filterRow: { paddingHorizontal: 16, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    backgroundColor: Colors.bgCard,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, color: Colors.muted },
  filterChipTextActive: { color: Colors.white, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
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
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
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
