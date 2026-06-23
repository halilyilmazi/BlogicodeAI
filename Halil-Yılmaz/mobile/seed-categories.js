const https = require('https');

const TOKEN = 'blogicodeai-jwt-token-777';
const USER_ID = '6a3ac53f38e8497d75730e85';

const POSTS = [
  // ── YAPAY ZEKA ──
  {
    title: 'ChatGPT ile Kod Yazmak: Avantajlar ve Riskler',
    category: 'Yapay Zeka',
    tags: ['chatgpt', 'llm', 'yapay-zeka', 'kod'],
    content: 'ChatGPT ve benzeri yapay zeka araçları, yazılım geliştirme sürecini kökten değiştirdi. LLM tabanlı bu araçlar kod tamamlama, hata ayıklama ve dokümantasyon oluşturma konularında geliştiricilere ciddi destek sağlıyor.\n\nAncak dikkat edilmesi gereken noktalar var. Yapay zekanın ürettiği kodun her zaman doğru olmadığını, güvenlik açıkları içerebileceğini ve eski kütüphane versiyonlarına göre öneri verebileceğini unutmamak gerekiyor.\n\nEn iyi yaklaşım, yapay zekayı bir asistan olarak kullanmak, üretilen kodu anlamak ve test etmektir. Deep learning modellerinin eğitim verileri belirli bir tarihte kesildiğinden güncel API değişikliklerini takip etmek de önemlidir.',
  },
  {
    title: 'NLP ile Türkçe Duygu Analizi Nasıl Yapılır?',
    category: 'Yapay Zeka',
    tags: ['nlp', 'derin-ogrenme', 'tensorflow', 'bert'],
    content: 'Doğal Dil İşleme (NLP), makinelerin insan dilini anlamasını sağlayan yapay zeka alt dalıdır. Türkçe metin işleme, morfolojik yapısı nedeniyle benzersiz zorluklar barındırır.\n\nTensorFlow ve PyTorch ile eğitilen derin öğrenme modelleri, duygu analizi, metin sınıflandırma ve varlık tanıma görevlerinde başarılı sonuçlar vermektedir. BERT mimarisi Türkçe için de fine-tuning yapılarak kullanılabilir.\n\nHuggingFace kütüphanesi bu süreçte büyük kolaylık sağlıyor. Binlerce pre-trained model arasından Türkçe destekleyen modelleri seçip kendi verinizle ince ayar yapabilirsiniz.',
  },
  {
    title: 'Makine Öğrenmesinde Veri Ön İşleme: Adım Adım Rehber',
    category: 'Yapay Zeka',
    tags: ['machine-learning', 'yapay-zeka', 'pandas', 'scikit-learn'],
    content: 'Her machine learning projesinin en kritik aşaması veri hazırlığıdır. Verinin kalitesi, modelin performansını doğrudan belirler. Eksik veri, aykırı değer ve dengesiz sınıf dağılımı en sık karşılaşılan sorunlardır.\n\nPandas ile eksik değerleri doldurmak, NumPy ile normalizasyon yapmak ve Scikit-learn ile train/test split oluşturmak temel adımlardır.\n\nFeature engineering aşamasında domain knowledge devreye girer. Hangi özelliklerin modele katkı sağlayacağını belirlemek için korelasyon analizi ve feature importance grafikleri rehberlik eder.',
  },

  // ── YAZILIM ──
  {
    title: 'SOLID Prensipleri: Daha İyi Kod Yazmanın Yolu',
    category: 'Yazılım',
    tags: ['solid', 'programlama', 'yazilim-muhendisligi', 'oop'],
    content: 'SOLID, nesne yönelimli programlamada kodun bakımını ve esnekliğini artıran beş temel prensibin baş harflerinden oluşur. Bu prensipler doğru uygulandığında yazılım projeleri daha sürdürülebilir hale gelir.\n\nSingle Responsibility: Her sınıf yalnızca bir sorumluluğa sahip olmalıdır. Open/Closed: Sınıflar genişlemeye açık, değişikliğe kapalı olmalıdır. Liskov Substitution: Alt sınıflar üst sınıfların yerine kullanılabilmelidir.\n\nInterface Segregation ve Dependency Inversion prensipleri de modüler ve test edilebilir kod yazımını kolaylaştırır. Bu prensipleri öğrenmek her yazılımcının öncelikli hedeflerinden biri olmalıdır.',
  },
  {
    title: 'JavaScript Async/Await: Asenkron Programlama Rehberi',
    category: 'Yazılım',
    tags: ['javascript', 'async', 'programlama', 'nodejs'],
    content: 'JavaScript\'in asenkron doğası, başlangıçta callback cehennemiyle baş edilmesini gerektiriyordu. Promise yapısıyla bu durum iyileşti, async/await ile ise asenkron kod neredeyse senkron kod kadar okunabilir hale geldi.\n\nasync fonksiyonlar her zaman bir Promise döner. await anahtar kelimesi ise bir Promise\'in tamamlanmasını bekler. Bu sayede try/catch ile hata yönetimi yapılabilir, kod akışı daha anlaşılır olur.\n\nParalel işlemler için Promise.all() kullanımı performansı artırır. Birden fazla bağımsız API çağrısını eş zamanlı başlatmak, sıralı beklemekten çok daha hızlıdır.',
  },

  // ── MOBİL ──
  {
    title: 'Flutter vs React Native: 2026 Karşılaştırması',
    category: 'Mobil Geliştirme',
    tags: ['flutter', 'react-native', 'mobil', 'android', 'ios'],
    content: 'Mobil uygulama geliştirmede iki büyük cross-platform framework olan Flutter ve React Native, geliştiriciler arasında süregelen bir tartışmanın konusudur.\n\nFlutter, Dart diliyle çalışır ve kendi render motorunu kullanır. Bu sayede her iki platformda piksel düzeyinde tutarlı görünüm sağlar. Performansı oldukça yüksektir.\n\nReact Native ise JavaScript ve TypeScript kullanır. Mevcut web bilgisini mobile taşımak isteyenler için daha kolay bir geçiş sağlar. Expo ile kurulumu son derece basittir ve hızlı prototipleme için idealdir.\n\n2026 itibarıyla her iki framework de güçlü ekosisteme sahiptir. Takım yetkinliği ve proje gereksinimlerine göre seçim yapılmalıdır.',
  },
  {
    title: 'Android Uygulama Güvenliği: Temel Prensipler',
    category: 'Mobil Geliştirme',
    tags: ['android', 'mobil', 'guvenlik', 'kotlin'],
    content: 'Mobil uygulama güvenliği, kullanıcı verilerini korumak açısından kritik öneme sahiptir. Android platformunda dikkat edilmesi gereken başlıca konular; güvenli veri saklama, ağ iletişimi şifreleme ve kimlik doğrulamadır.\n\nSharedPreferences yerine EncryptedSharedPreferences kullanımı hassas verilerin korunmasını sağlar. Ağ isteklerinde HTTPS zorunlu tutulmalı, sertifika pinning uygulanmalıdır.\n\nKimlik doğrulama için JWT token güvenli depolama alanlarında saklanmalıdır. Kotlin ile geliştirilen Android uygulamalarında ProGuard/R8 ile kod karartma da önemli bir güvenlik katmanı ekler.',
  },

  // ── BULUT ──
  {
    title: 'AWS ile Sunucusuz Mimari: Lambda ve API Gateway',
    category: 'Bulut Teknolojileri',
    tags: ['aws', 'serverless', 'bulut', 'lambda', 'cloud'],
    content: 'Sunucusuz (serverless) mimari, uygulama geliştiricilerinin altyapı yönetimiyle uğraşmadan kod yazmasını sağlar. AWS Lambda, yalnızca çalıştığı süre için ücretlendirilir ve otomatik ölçeklenir.\n\nAPI Gateway ile Lambda fonksiyonlarını HTTP API olarak dışa açmak son derece kolaydır. Bu kombinasyon, geleneksel sunucu altyapısına kıyasla %70\'e varan maliyet tasarrufu sağlayabilir.\n\nCloud tabanlı bu mimaride cold start süresi göz önüne alınmalıdır. Node.js ve Python runtime\'ları en düşük cold start sürelerine sahiptir. SaaS ürünleri için event-driven tasarım ile mükemmel uyum sağlar.',
  },
  {
    title: 'Azure DevOps ile CI/CD Pipeline Kurulumu',
    category: 'Bulut Teknolojileri',
    tags: ['azure', 'bulut', 'cicd', 'devops', 'cloud'],
    content: 'Azure DevOps, yazılım geliştirme süreçlerini uçtan uca yönetmek için kapsamlı bir platform sunar. Boards, Repos, Pipelines, Artifacts ve Test Plans modülleriyle eksiksiz bir DevOps deneyimi sağlar.\n\nCI/CD pipeline oluşturmak için Azure Pipelines YAML dosyalarını kullanmak en modern yaklaşımdır. Her commit sonrası otomatik build, test ve deploy süreçleri tetiklenir.\n\nGCP ve diğer bulut sağlayıcılarıyla entegrasyon da mümkündür. Multi-cloud stratejisi benimseyen kuruluşlar için Azure\'ın hibrit bulut desteği büyük avantaj sağlar.',
  },

  // ── SİBER GÜVENLİK ──
  {
    title: 'Zero Trust Güvenlik Mimarisi Nedir ve Nasıl Uygulanır?',
    category: 'Siber Güvenlik',
    tags: ['zero-trust', 'siber-guvenlik', 'guvenlik', 'network'],
    content: 'Zero Trust, "asla güvenme, her zaman doğrula" felsefesi üzerine kurulu modern bir siber güvenlik yaklaşımıdır. Geleneksel perimeter güvenliğinin aksine, ağın içindeki ve dışındaki hiçbir kullanıcı veya cihaz varsayılan olarak güvenilir kabul edilmez.\n\nUygulama adımları şunlardır: Kimlik doğrulamayı güçlendirmek (MFA), least privilege erişim politikası, mikro-segmentasyon ve sürekli izleme. Şifreleme her aşamada zorunlu tutulmalıdır.\n\nSiber saldırıların giderek sofistike hale geldiği günümüzde zero trust mimarisi kurumsal güvenliğin temeli haline gelmektedir. Malware ve phishing saldırılarına karşı en etkili savunma stratejilerinden biridir.',
  },
  {
    title: 'OWASP Top 10: Web Uygulamalarındaki Kritik Güvenlik Açıkları',
    category: 'Siber Güvenlik',
    tags: ['owasp', 'guvenlik', 'web-guvenligi', 'siber', 'sql-injection'],
    content: 'OWASP Top 10, web uygulamalarında en sık karşılaşılan güvenlik açıklarını listeleyen ve sektör standardı haline gelen bir referans belgesidir.\n\nInjection saldırıları, özellikle SQL Injection, hala listenin başlarında yer almaktadır. Kullanıcı girdilerini parameterized query ile işlemek bu açığı büyük ölçüde giderir. Broken Authentication, Cross-Site Scripting (XSS) ve Insecure Direct Object References da kritik kategorilerdedir.\n\nGüvenlik testleri için OWASP ZAP ve Burp Suite gibi pentest araçları kullanılabilir. Her yazılımcının bu listeyi bilmesi ve kodlarken bu riskleri göz önünde bulundurması gerekir.',
  },

  // ── VERİ BİLİMİ ──
  {
    title: 'Python ile Veri Bilimi: Pandas ve NumPy Temelleri',
    category: 'Veri Bilimi',
    tags: ['veri-bilimi', 'python', 'pandas', 'numpy', 'data-science'],
    content: 'Veri bilimi dünyasında Python vazgeçilmez bir araç haline gelmiştir. Pandas kütüphanesi, yapısal veriyi DataFrame formatında kolayca işlemenizi sağlar. CSV, Excel, JSON ve SQL gibi kaynaklardan veri okuma tek satır kod meselesidir.\n\nNumPy ise sayısal hesaplamalar için optimize edilmiş array yapıları sunar. Pandas\'ın altında da NumPy çalışır. Büyük veri setlerinde bellek kullanımını optimize etmek için veri tiplerini dikkatli seçmek gerekir.\n\nBig data analitik süreçlerinde ETL pipeline\'ları kritik rol oynar. Veriyi temizlemek, dönüştürmek ve yüklemek için iyi tasarlanmış bir pipeline, projenin başarısını doğrudan etkiler.',
  },
  {
    title: 'Veri Görselleştirme: Matplotlib ve Seaborn ile Grafikler',
    category: 'Veri Bilimi',
    tags: ['veri-bilimi', 'analitik', 'python', 'gorsellestime', 'data-science'],
    content: 'Veriden anlam çıkarmanın en etkili yollarından biri görselleştirmedir. Matplotlib, Python ekosisteminin temel görselleştirme kütüphanesidir. Her türlü grafik tipini destekler ve tam özelleştirme imkanı sunar.\n\nSeaborn ise Matplotlib üzerine kurulu, istatistiksel görselleştirme için optimize edilmiş bir kütüphanedir. Heatmap, pairplot ve violin plot gibi gelişmiş grafikler birkaç satır kodla oluşturulabilir.\n\nBig data analitik projelerinde verileri anlaşılır biçimde sunmak, karar vericilere doğru bilgiyi iletmek açısından kritiktir. İnteraktif görselleştirme için Plotly ve Dash kütüphaneleri de tercih edilebilir.',
  },

  // ── BLOCKCHAIN ──
  {
    title: 'Akıllı Sözleşmeler ve Solidity\'ye Giriş',
    category: 'Blockchain',
    tags: ['blockchain', 'ethereum', 'solidity', 'web3', 'akilli-sozlesme'],
    content: 'Blockchain teknolojisinin en heyecan verici uygulamalarından biri akıllı sözleşmelerdir. Ethereum üzerinde çalışan bu self-executing kodlar, aracı olmadan güvenli işlem yapılmasını sağlar.\n\nSolidity, Ethereum için tasarlanmış nesne yönelimli bir programlama dilidir. JavaScript\'e benzer sözdizimiyle öğrenmesi görece kolaydır. Remix IDE ile tarayıcı üzerinden akıllı sözleşme geliştirip test edebilirsiniz.\n\nDeFi protokolleri, NFT platformları ve DAO yapıları blockchain ve akıllı sözleşmelerin en popüler kullanım alanlarıdır. Güvenlik açıkları büyük maddi kayıplara neden olabileceğinden audit süreci kritik öneme sahiptir.',
  },
  {
    title: 'Web3 ve Merkeziyetsiz Uygulamalar (DApp) Nedir?',
    category: 'Blockchain',
    tags: ['web3', 'blockchain', 'dapp', 'defi', 'nft'],
    content: 'Web3, internetin merkeziyetsiz bir versiyonunu temsil eder. Kripto para birimleri, blockchain teknolojisi ve akıllı sözleşmeler üzerine inşa edilen bu ekosistem, kullanıcılara verilerinin kontrolünü geri verir.\n\nMerkeziyetsiz uygulamalar (DApp), geleneksel web uygulamalarından farklı olarak blockchain üzerinde çalışır. Bu uygulamaların ön yüzü React veya Next.js ile, blockchain bağlantısı ise ethers.js veya wagmi gibi kütüphanelerle sağlanır.\n\nDeFi protokolleri likidite havuzları, yield farming ve staking gibi finansal araçlar sunar. Ethereum, Solana ve Polygon bu ekosistemin en aktif blockchain ağlarıdır.',
  },

  // ── DEVOPS ──
  {
    title: 'Docker ile Konteynerizasyon: Başlangıç Rehberi',
    category: 'DevOps',
    tags: ['docker', 'devops', 'konteyner', 'kubernetes'],
    content: 'Docker, uygulamaları konteyner adı verilen izole ortamlarda çalıştırmanızı sağlar. "Bende çalışıyor" sorununu ortadan kaldıran bu teknoloji, modern yazılım geliştirmenin vazgeçilmezi haline geldi.\n\nDockerfile ile uygulamanızın çalışma ortamını tanımlarsınız. docker-compose ise çoklu servisli uygulamaları tek komutla ayağa kaldırmanızı sağlar. Geliştirme ve üretim ortamları arasındaki tutarlılığı garanti eder.\n\nKubernetes (k8s) ile Docker konteynerlerini büyük ölçekte orkestre edebilirsiniz. Otomatik ölçekleme, yük dengeleme ve sıfır kesinti dağıtımı Kubernetes\'in öne çıkan özellikleridir. GitOps yaklaşımıyla CI/CD entegrasyonu da kolaylaşır.',
  },
  {
    title: 'Kubernetes ile Mikroservis Yönetimi',
    category: 'DevOps',
    tags: ['kubernetes', 'k8s', 'devops', 'mikroservis', 'docker'],
    content: 'Kubernetes, konteynerleştirilmiş uygulamaların dağıtımını, ölçeklenmesini ve yönetimini otomatize eden açık kaynaklı bir orkestrasyon platformudur. Google tarafından geliştirilen bu sistem günümüzde CNCF tarafından yönetilmektedir.\n\nPod, Deployment, Service ve Ingress gibi temel kavramları anlamak Kubernetes kullanımının temelidir. Helm chart\'ları ile karmaşık uygulamaları paketleyip dağıtabilirsiniz.\n\nGitOps metodolojisi ile Kubernetes konfigürasyonlarını Git deposunda tutmak, altyapıyı kod olarak yönetme pratiğini hayata geçirir. ArgoCD ve Flux bu alanda öne çıkan araçlardır. CI/CD pipeline entegrasyonu ile tam otomasyon mümkün olur.',
  },

  // ── VERİTABANI ──
  {
    title: 'MongoDB vs PostgreSQL: Hangi Veritabanı Ne Zaman Kullanılır?',
    category: 'Veritabanı',
    tags: ['mongodb', 'postgresql', 'veritabani', 'nosql', 'sql'],
    content: 'Veritabanı seçimi, projenin başarısını doğrudan etkileyen kritik bir karardır. İlişkisel (SQL) ve belge tabanlı (NoSQL) veritabanlarının birbirinden farklı güçlü yönleri vardır.\n\nPostgreSQL, ACID uyumluluğu ve güçlü JOIN desteğiyle karmaşık ilişkisel verilerin yönetiminde liderdir. Finans, e-ticaret ve kurumsal uygulamalar için idealdir. JSON desteği de giderek gelişmektedir.\n\nMongoDB ise şemasız yapısıyla hızlı geliştirme ve değişen veri modellerine kolay uyum sağlar. Yatay ölçekleme (sharding) konusunda üstündür. Redis ile birlikte kullanıldığında önbellekleme performansı ciddi artış gösterir.',
  },
  {
    title: 'Redis ile Yüksek Performanslı Önbellekleme Stratejileri',
    category: 'Veritabanı',
    tags: ['redis', 'veritabani', 'cache', 'performans', 'nosql'],
    content: 'Redis, bellekte çalışan ultra hızlı bir anahtar-değer veritabanıdır. Önbellekleme, session yönetimi, pub/sub mesajlaşma ve gerçek zamanlı sıralamalar için yaygın olarak kullanılır.\n\nCache invalidation stratejisi doğru belirlenmezse tutarsız veri sorunları ortaya çıkabilir. TTL (Time To Live) değerlerini iş kurallarına göre ayarlamak kritik öneme sahiptir. Cache-aside, write-through ve write-behind gibi farklı stratejiler farklı senaryolara uygundur.\n\nNode.js ve Python uygulamalarında ioredis ve redis-py kütüphaneleri ile kolay entegrasyon sağlanır. Yüksek trafikli SQL sorgularını Redis ile önbelleğe almak, veritabanı yükünü dramatik biçimde azaltır.',
  },

  // ── ROBOTİK & IoT ──
  {
    title: 'Arduino ile IoT Projesi: Akıllı Ev Otomasyonu',
    category: 'Robotik & IoT',
    tags: ['arduino', 'iot', 'robotik', 'otomasyon', 'sensor'],
    content: 'Nesnelerin İnterneti (IoT), fiziksel cihazların internet üzerinden birbirleriyle ve yazılım sistemleriyle iletişim kurmasını sağlar. Arduino, bu alanda giriş seviyesi projeler için en popüler platformdur.\n\nDHT11 sıcaklık sensörü, PIR hareket sensörü ve servo motor gibi bileşenlerle akıllı ev otomasyonu projeleri gerçekleştirilebilir. ESP8266 veya ESP32 modülleri ile Wi-Fi bağlantısı eklenerek veriler buluta gönderilebilir.\n\nROS (Robot Operating System) ise daha gelişmiş robotik uygulamalar için tercih edilen açık kaynaklı bir framework\'tür. Endüstriyel robot uygulamalarında cobot (işbirlikçi robot) sistemleri giderek yaygınlaşmaktadır.',
  },
  {
    title: 'ROS ile Robot Programlama: Temel Kavramlar',
    category: 'Robotik & IoT',
    tags: ['ros', 'robotik', 'robot', 'otomasyon', 'python'],
    content: 'ROS (Robot Operating System), robotik yazılım geliştirme için standart haline gelen açık kaynaklı bir framework\'tür. Aslında bir işletim sistemi değil, robotik uygulamalar için araçlar, kütüphaneler ve konvansiyonlar bütünüdür.\n\nNode\'lar, topic\'ler, servisler ve action\'lar ROS\'un temel yapı taşlarıdır. Publisher/subscriber mimarisi ile farklı modüller birbirinden bağımsız çalışabilir ve iletişim kurabilir.\n\nROSbot, TurtleBot ve Spot gibi robotlar ROS ile programlanabilir. Gazebo simülatörü ile gerçek donanım olmadan robot algoritmaları test edilebilir. Python ve C++ en yaygın kullanılan dilledir.',
  },
];

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'blogicode-ai.vercel.app',
      path: '/api' + path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`\n📚 ${POSTS.length} yazı ekleniyor...\n`);
  let ok = 0, fail = 0;
  for (const post of POSTS) {
    const res = await request('POST', '/posts', { ...post, authorId: USER_ID }, TOKEN);
    if (res.status === 200 || res.status === 201) {
      console.log(`✅ [${post.category}] ${post.title.substring(0, 50)}`);
      ok++;
    } else {
      console.log(`❌ [${post.category}] ${post.title.substring(0, 50)} → ${res.body?.message || res.status}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`\n🎉 Tamamlandı: ${ok} başarılı, ${fail} başarısız`);
}

main().catch(console.error);
