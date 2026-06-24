import { Post, User } from '../types';

/**
 * Gerçekçi, çeşitli yer tutucu yazar adları — yerel (Türkçe) ve uluslararası karışık.
 * authorId veritabanından bir kullanıcı nesnesine çözülemediğinde (seed/placeholder
 * yazılar) "Yazar" gibi jenerik etiket yerine bu listeden tutarlı bir ad gösterilir.
 */
const PLACEHOLDER_NAMES = [
  'Ahmet Yılmaz', 'Elif Kaya', 'Mehmet Demir', 'Zeynep Şahin', 'Mustafa Çelik',
  'Ayşe Yıldız', 'Emre Aydın', 'Selin Koç', 'Burak Doğan', 'Merve Aksoy',
  'Can Öztürk', 'Ece Korkmaz', 'Kerem Yalçın', 'Buse Erdoğan', 'Deniz Polat',
  'James Carter', 'Sofia Müller', 'Liam Johnson', 'Emma Schmidt', 'Lucas Rossi',
  'Olivia Brown', 'Noah Martin', 'Mia Fernández', 'Daniel Kim', 'Hannah Wagner',
  'Ethan Davis', 'Yuki Tanaka', 'Arjun Patel', 'Clara Dubois', 'Marco Bianchi',
];

/** Basit, kararlı string hash (djb2 türevi) — aynı seed her zaman aynı adı verir. */
function hashString(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Verilen tohumdan (örn. id) deterministik gerçekçi bir ad seçer. */
export function placeholderName(seed?: string): string {
  const s = seed && seed.length ? seed : 'anonim';
  return PLACEHOLDER_NAMES[hashString(s) % PLACEHOLDER_NAMES.length];
}

function fullName(u: Partial<User> | null | undefined): string {
  if (!u) return '';
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
}

/**
 * Bir yazının görünen yazar adı.
 * authorId populate edilmiş bir kullanıcı nesnesiyse gerçek ad kullanılır;
 * değilse yazının _id'sine göre çeşitli, gerçekçi bir yer tutucu ad döner.
 */
export function postAuthorName(post: Pick<Post, '_id' | 'authorId'>): string {
  const a = post.authorId;
  if (a && typeof a === 'object') {
    const name = fullName(a);
    if (name) return name;
  }
  return placeholderName(post._id);
}
