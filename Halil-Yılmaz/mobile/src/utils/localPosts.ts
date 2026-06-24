import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post } from '../types';

/**
 * Kullanıcının uygulama içinde oluşturduğu yazıların yerel kopyası.
 * Backend (canlı API / MongoDB) erişilemediğinde bile kullanıcının kendi
 * yazıları Profil sekmesinde görünebilsin diye AsyncStorage'da tutulur.
 * Backend tekrar erişilebilir olduğunda backend sonuçlarıyla _id'ye göre
 * tekilleştirilerek birleştirilir.
 */
const KEY = 'local_posts_v1';

export async function getLocalPosts(): Promise<Post[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function addLocalPost(post: Post): Promise<void> {
  try {
    const list = await getLocalPosts();
    await AsyncStorage.setItem(KEY, JSON.stringify([post, ...list]));
  } catch {
    /* yoksay */
  }
}

export async function removeLocalPost(id: string): Promise<void> {
  try {
    const list = await getLocalPosts();
    await AsyncStorage.setItem(KEY, JSON.stringify(list.filter((p) => p._id !== id)));
  } catch {
    /* yoksay */
  }
}

/** Belirli bir kullanıcının yerel yazılarını getirir. */
export async function getLocalPostsByAuthor(authorId: string): Promise<Post[]> {
  const list = await getLocalPosts();
  return list.filter((p) => {
    const a = p.authorId;
    const id = typeof a === 'string' ? a : a?._id;
    return id === authorId;
  });
}

/** İki listeyi _id'ye göre tekilleştirerek birleştirir (a önceliklidir). */
export function mergePostsById(a: Post[], b: Post[]): Post[] {
  const seen = new Set(a.map((p) => p._id));
  return [...a, ...b.filter((p) => !seen.has(p._id))];
}
