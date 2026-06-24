import { Post } from '../types';

/**
 * Keşfet akışı için örnek/yedek yazılar.
 * Backend (canlı API + MongoDB) erişilemediğinde veya hiç yazı dönmediğinde
 * akışın boş kalmaması için kullanılır. Her birinin sabit _id'si vardır; yazar
 * adları authorNames yardımcılarıyla gerçekçi ve çeşitli görünür.
 */
export const SAMPLE_POSTS: Post[] = [
  {
    _id: 'sample-1',
    title: 'Üretken Yapay Zeka 2026: Ajanlar Çağı Başlıyor',
    content:
      'Üretken yapay zeka artık yalnızca metin üretmiyor; kendi başına araç kullanıp çok adımlı görevleri tamamlayan AI ajanları gündemin merkezinde. Bu yazıda LLM tabanlı ajan mimarilerini, RAG ile kendi verinle konuşan sistemleri ve kurumsal kullanım senaryolarını ele alıyoruz.',
    category: 'Yapay Zeka',
    tags: ['yapay-zeka', 'llm', 'ai-ajan'],
    authorId: 'seed-author-01',
    likeCount: 128,
    favoriteCount: 64,
    createdAt: '2026-06-20T09:00:00.000Z',
  },
  {
    _id: 'sample-2',
    title: 'React Native ile Mobil Geliştirmeye Başlangıç',
    content:
      'Tek kod tabanıyla hem iOS hem Android uygulaması geliştirmek isteyenler için React Native güçlü bir seçenek. Expo ile proje kurulumu, navigasyon, durum yönetimi ve cihaz API’lerine erişimi adım adım anlatıyoruz.',
    category: 'Mobil',
    tags: ['mobil', 'react-native', 'expo'],
    authorId: 'seed-author-02',
    likeCount: 96,
    favoriteCount: 41,
    createdAt: '2026-06-19T14:30:00.000Z',
  },
  {
    _id: 'sample-3',
    title: 'Docker ve Kubernetes: Modern Dağıtımın Temelleri',
    content:
      'Konteyner teknolojileri yazılım dağıtımını kökten değiştirdi. Docker ile uygulamanı paketle, Kubernetes ile ölçekle. Bu rehberde imaj oluşturma, compose dosyaları ve temel bir k8s deployment’ı ele alınıyor.',
    category: 'DevOps',
    tags: ['devops', 'docker', 'kubernetes'],
    authorId: 'seed-author-03',
    likeCount: 152,
    favoriteCount: 88,
    createdAt: '2026-06-18T11:15:00.000Z',
  },
  {
    _id: 'sample-4',
    title: 'Sıfır Güven (Zero Trust) Mimarisi Nedir?',
    content:
      '“Hiçbir şeye baştan güvenme, her erişimi doğrula” yaklaşımı modern siber güvenliğin temeli haline geldi. Kimlik doğrulama, en az yetki ilkesi ve mikro segmentasyon ile kurumsal ağları nasıl koruyabileceğini inceliyoruz.',
    category: 'Siber Güvenlik',
    tags: ['siber-guvenlik', 'zero-trust', 'mfa'],
    authorId: 'seed-author-04',
    likeCount: 73,
    favoriteCount: 35,
    createdAt: '2026-06-17T16:45:00.000Z',
  },
  {
    _id: 'sample-5',
    title: 'Veri Biliminde Python: Pandas ile İlk Adımlar',
    content:
      'Veri analizinin vazgeçilmezi Pandas ile veri çerçeveleri oluşturmayı, temizlemeyi ve özetlemeyi öğren. Gerçek bir veri seti üzerinde keşifsel veri analizi (EDA) örnekleriyle ilerliyoruz.',
    category: 'Veri Bilimi',
    tags: ['veri-bilimi', 'python', 'pandas'],
    authorId: 'seed-author-05',
    likeCount: 110,
    favoriteCount: 57,
    createdAt: '2026-06-16T10:05:00.000Z',
  },
  {
    _id: 'sample-6',
    title: 'Blockchain ve Akıllı Sözleşmeler 101',
    content:
      'Merkezi olmayan, değiştirilemez kayıt defteri fikri pek çok sektörü dönüştürüyor. Ethereum üzerinde çalışan akıllı sözleşmelerin mantığını, DeFi ve NFT uygulamalarının temellerini sade bir dille açıklıyoruz.',
    category: 'Blockchain',
    tags: ['blockchain', 'ethereum', 'web3'],
    authorId: 'seed-author-06',
    likeCount: 64,
    favoriteCount: 29,
    createdAt: '2026-06-15T13:20:00.000Z',
  },
  {
    _id: 'sample-7',
    title: 'Bulutta Sunucusuz (Serverless) Mimariler',
    content:
      'Altyapıyla uğraşmadan fonksiyon çalıştırmak isteyenler için serverless harika bir model. AWS Lambda, Vercel ve Cloudflare Workers örnekleriyle maliyet, ölçeklenme ve soğuk başlangıç konularını ele alıyoruz.',
    category: 'Bulut',
    tags: ['bulut', 'serverless', 'aws'],
    authorId: 'seed-author-07',
    likeCount: 87,
    favoriteCount: 44,
    createdAt: '2026-06-14T08:50:00.000Z',
  },
  {
    _id: 'sample-8',
    title: 'MongoDB ile Esnek Veri Modelleme',
    content:
      'İlişkisel olmayan veritabanları, hızlı değişen şemalarla çalışmayı kolaylaştırır. MongoDB’de belge tasarımı, gömülü dökümanlar ve indeksleme stratejilerini pratik örneklerle gösteriyoruz.',
    category: 'Veritabanı',
    tags: ['veritabani', 'mongodb', 'nosql'],
    authorId: 'seed-author-08',
    likeCount: 78,
    favoriteCount: 33,
    createdAt: '2026-06-13T17:35:00.000Z',
  },
];
