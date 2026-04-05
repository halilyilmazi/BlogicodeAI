/**
 * Örnek blog yazılarını ekler. Tekrar çalıştırılabilir: yalnızca etiketli seed yoksa ekler.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error('MONGODB_URI tanımlı değil. backend/.env dosyasına index.js ile aynı satırı ekleyin.');
    process.exit(1);
}

const User = mongoose.model('User', new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    username: { type: String, default: '' },
    bio: { type: String, default: '' },
    profession: { type: String, default: '' },
    gender: { type: String, default: '' },
    birthDate: { type: String, default: '' },
    profilePhoto: { type: String, default: '' }
}, { timestamps: true }));

const Post = mongoose.model('Post', new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String },
    authorId: { type: String, required: true },
    tags: [String],
    likeCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    favoritedBy: { type: [String], default: [] }
}, { timestamps: true }));

const SEED_TAG = 'blogicode-seed';

const SAMPLE_POSTS = [
    {
        title: 'Yapay zeka ile günlük iş akışını hızlandırma',
        category: 'Yapay Zeka & ML',
        content: 'Büyük dil modelleri ve otomasyon araçlarıyla tekrarlayan görevleri azaltmak mümkün. Prompt mühendisliği ve güvenli veri sınırları kurarak ekipler üretkenliği artırabilir. Yapay zeka destekli özetleme ve kod tamamlama araçları geliştirici deneyimini ciddi şekilde iyileştiriyor.',
        tags: [SEED_TAG, 'yapay zeka', 'llm', 'verimlilik']
    },
    {
        title: 'Siber güvenlikte sıfır güven mimarisi',
        category: 'Siber Güvenlik',
        content: 'Kurumsal ağlarda her isteği doğrulamak, mikro segmentasyon ve çok faktörlü kimlik doğrulama ile birleşince saldırı yüzeyini küçültür. Pentest sonuçlarını düzenli tekrarlamak ve zafiyet yönetimini otomatikleştirmek sürdürülebilir güvenlik sağlar.',
        tags: [SEED_TAG, 'siber güvenlik', 'zero trust']
    },
    {
        title: 'Bulut maliyetlerini AWS ile optimize etmek',
        category: 'Bulut & SaaS',
        content: 'Reserved instance ve spot kullanımı, doğru boyutlandırma ve idle kaynakların kapatılması faturayı düşürür. AWS Cost Explorer ve bütçe alarmları ile ekipler harcamayı şeffaf tutabilir. Serverless geçişi düşük trafikli API\'ler için mantıklı bir adım.',
        tags: [SEED_TAG, 'bulut', 'aws', 'saas']
    },
    {
        title: 'Endüstriyel robotik ve ROS ile prototipleme',
        category: 'Robotik',
        content: 'Robot Operating System (ROS) ile sensör verisini işleyip servo kontrolü sağlamak prototip döngüsünü kısaltır. Cobot güvenliği ve IoT entegrasyonu fabrika otomasyonunda öne çıkıyor. Arduino tabanlı deneyler öğrenme eğrisini düşürür.',
        tags: [SEED_TAG, 'robotik', 'ros', 'iot']
    },
    {
        title: 'Veri bilimi pipeline\'larında ETL ve kalite',
        category: 'Veri Bilimi',
        content: 'Ham veriyi güvenilir feature\'lara dönüştürmek için Pandas ve Spark sık kullanılır. Büyük veri setlerinde şema evrimi ve eksik değer stratejileri model başarısını doğrudan etkiler. Analitik dashboard\'lar karar vericilere net özet sunar.',
        tags: [SEED_TAG, 'veri bilimi', 'etl', 'pandas']
    },
    {
        title: 'Kubernetes ve GitOps ile DevOps olgunluğu',
        category: 'DevOps',
        content: 'Docker imajlarını registry\'de sabitlemek ve Kubernetes ile rollout yapmak sürekli teslimatın kalbidir. Argo CD veya Flux ile GitOps, altyapı ve uygulama sürümlerini denetlenebilir kılar. CI/CD hatlarında güvenlik taraması zorunlu olmalı.',
        tags: [SEED_TAG, 'devops', 'kubernetes', 'docker']
    },
    {
        title: 'Flutter ile çapraz platform mobil geliştirme',
        category: 'Mobil Geliştirme',
        content: 'Tek kod tabanından Android ve iOS çıktısı almak zaman kazandırır. Widget ağacı ve durum yönetimi için Riverpod veya Bloc tercih edilebilir. Performans için görselleri önbelleğe almak ve liste optimizasyonu önemlidir.',
        tags: [SEED_TAG, 'mobil', 'flutter', 'android']
    },
    {
        title: 'Web3 ve akıllı sözleşmelerde güvenlik tuzakları',
        category: 'Blockchain & Web3',
        content: 'Solidity ile yazılan kontratlarda reentrancy ve taşma hataları pahalıya patlayabilir. Formal doğrulama ve denetimler DeFi projeleri için kritik. Ethereum ve L2 çözümleri işlem ücretlerini yönetilebilir kılıyor.',
        tags: [SEED_TAG, 'blockchain', 'ethereum', 'web3']
    },
    {
        title: 'Ağ mühendisliğinde VLAN ve yönlendirme temelleri',
        category: 'Ağ Teknolojileri',
        content: 'Switch katmanında VLAN ayrımı yayın fırtınalarını sınırlar. OSPF ve BGP kararları uçtan uca gecikmeyi şekillendirir. IPv6 geçiş planı uzun vadede adres tükenmesini önler.',
        tags: [SEED_TAG, 'ağ', 'network', 'routing']
    },
    {
        title: 'PostgreSQL ve Redis ile ölçeklenebilir veri katmanı',
        category: 'Veritabanları',
        content: 'İlişkisel model için PostgreSQL güçlü bir seçim; JSONB ile esnek alanlar da tutulabilir. Redis önbellek ve oturum depolama için düşük gecikme sunar. İndeks stratejisi ve connection pooling sorgu performansını belirler.',
        tags: [SEED_TAG, 'veritabanı', 'postgresql', 'redis']
    },
    {
        title: 'Modern JavaScript ile frontend mimarisi',
        category: 'Yazılım Geliştirme',
        content: 'Modüler bileşenler, tip güvenliği için TypeScript ve paket yöneticisi disiplini büyük projelerde hayat kurtarır. Kod incelemesi ve lint kuralları regresyon riskini azaltır. Developer experience araçları ekip hızını artırır.',
        tags: [SEED_TAG, 'yazılım', 'javascript', 'programlama']
    },
    {
        title: 'Derin öğrenme ile görüntü sınıflandırma',
        category: 'Yapay Zeka & ML',
        content: 'PyTorch veya TensorFlow ile CNN eğitimi yapılırken veri artırma genelleme sağlar. Transfer learning az veriyle bile güçlü sonuç verebilir. Model izleme ve drift tespiti üretim ortamında şart.',
        tags: [SEED_TAG, 'deep learning', 'pytorch', 'tensorflow']
    },
    {
        title: 'Bulutta SaaS ürünü ölçeklendirme notları',
        category: 'Bulut & SaaS',
        content: 'Çok kiracılı mimaride veri izolasyonu ve kota yönetimi önceliklidir. Ödeme entegrasyonu ve webhook güvenliği operasyonel yük getirir. GCP ve Azure alternatifleri coğrafi gereksinimlere göre değerlendirilmeli.',
        tags: [SEED_TAG, 'saas', 'cloud', 'ölçekleme']
    },
    {
        title: 'Şifreleme ve anahtar yönetimi en iyi uygulamaları',
        category: 'Siber Güvenlik',
        content: 'Durağan sırları repoda tutmamak, KMS ve donanım modülleri kullanmak standarttır. TLS sürümlerini güncel tutmak ve sertifika yenilemeyi otomatikleştirmek operasyonel hatayı azaltır.',
        tags: [SEED_TAG, 'encryption', 'güvenlik']
    },
    {
        title: 'Robot kol kinematiği ve güvenli çalışma alanı',
        category: 'Robotik',
        content: 'Endüstriyel robot tekrarlanan işleri milimetrik hassasiyetle yapar. Güvenlik bariyerleri ve acil durdurma devreleri operatör koruma sağlar. ROS 2 ile gerçek zamanlı iletişim iyileştirildi.',
        tags: [SEED_TAG, 'robot', 'otomasyon', 'cobot']
    },
    {
        title: 'ChatGPT ve kurumsal veri: sınırlar ve politikalar',
        category: 'Yapay Zeka & ML',
        content: 'LLM kullanırken hassas veriyi dışarı sızdırmamak için anonimleştirme ve onay akışları gerekir. Fine-tuning ve RAG yaklaşımları şirket bilgisini modele kontrollü şekilde dahil eder.',
        tags: [SEED_TAG, 'chatgpt', 'llm', 'nlp']
    },
    {
        title: 'Sunucusuz mimari ve olay güdümlü tasarım',
        category: 'Yazılım Geliştirme',
        content: 'Fonksiyonlar kısa ömürlü iş yükleri için uygundur; soğuk başlatma gecikmesi göz önünde bulundurulmalı. Olay kuyrukları gevşek bağlı servisleri birbirine bağlar.',
        tags: [SEED_TAG, 'serverless', 'backend']
    },
    {
        title: 'Mobil uygulamalarda güvenli kimlik doğrulama',
        category: 'Mobil Geliştirme',
        content: 'Biometric ve OAuth birleşimi kullanıcı deneyimini güçlendirir. Token yenileme ve güvenli depolama iOS Keychain ve Android Keystore ile sağlanır.',
        tags: [SEED_TAG, 'ios', 'oauth', 'mobil']
    }
];

async function run() {
    await mongoose.connect("mongodb+srv://ylmzyzlm:iHy.4090@cluster0.yzs8d09.mongodb.net/blogicode?appName=Cluster0");
    const existing = await Post.countDocuments({ tags: SEED_TAG });
    if (existing >= SAMPLE_POSTS.length) {
        console.log('Seed yazılar zaten mevcut (' + existing + ' adet).');
        await mongoose.disconnect();
        process.exit(0);
    }

    let author = await User.findOne({ email: 'ornek@blogicodeai.seed' });
    if (!author) {
        author = await User.create({
            firstName: 'Blogicode',
            lastName: 'Editör',
            email: 'ornek@blogicodeai.seed',
            password: '__seed_only__',
            username: '@blogicode_editor',
            bio: 'Örnek içerikler için sistem kullanıcısı',
            profession: 'İçerik editörü'
        });
    }
    const authorId = String(author._id);

    const docs = SAMPLE_POSTS.map((p, i) => ({
        ...p,
        authorId,
        likeCount: 3 + (i % 8),
        favoriteCount: 1 + (i % 5)
    }));

    await Post.insertMany(docs);
    console.log('Eklendi: ' + docs.length + ' örnek yazı (authorId: ' + authorId + ')');
    await mongoose.disconnect();
    process.exit(0);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
