/**
 * Örnek blog yazılarını API üzerinden ekler.
 * Kullanım: node seed-posts.js <email> <şifre>
 */
const https = require('https');

const BASE = 'https://blogicode-ai.vercel.app/api';
const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Kullanım: node seed-posts.js <email> <şifre>');
  process.exit(1);
}

const POSTS = [
  {
    title: 'React Native ile Mobil Uygulama Geliştirmeye Başlamak',
    content: 'React Native, JavaScript kullanarak hem iOS hem de Android için native mobil uygulamalar geliştirmenizi sağlayan güçlü bir framework\'tür. Meta tarafından geliştirilen bu teknoloji, web geliştiricilerinin mobil dünyaya geçişini kolaylaştırmaktadır.\n\nReact Native\'in en büyük avantajı tek bir kod tabanıyla her iki platformu da hedefleyebilmenizdir. "Write once, run anywhere" felsefesiyle çalışan bu yapı, geliştirme sürecini ciddi ölçüde hızlandırır.\n\nExpo, React Native üzerine inşa edilmiş bir araç zinciridir ve başlangıç için mükemmel bir seçimdir. Karmaşık yapılandırma gerektirmeden hızlıca proje oluşturmanıza olanak tanır.',
    category: 'Yazılım',
    tags: ['react-native', 'mobil', 'javascript', 'expo'],
  },
  {
    title: 'Yapay Zeka ve Makine Öğrenmesi: 2026\'da Neredeyiz?',
    content: 'Yapay zeka alanında son yıllarda yaşanan gelişmeler, teknoloji dünyasını köklü biçimde dönüştürdü. Büyük dil modelleri (LLM) artık kod yazıyor, metin üretiyor, görsel analiz yapıyor ve karmaşık problemlere çözüm öneriyorlar.\n\nGPT, Claude, Gemini gibi modeller günlük hayatın ayrılmaz bir parçası haline geldi. Yazılım mühendisleri artık AI destekli araçlarla çalışarak verimliliği dramatik biçimde artırabiliyorlar.\n\nMakine öğrenmesi alanında ise özellikle transfer learning ve fine-tuning teknikleri ön plana çıkıyor. Az veriyle yüksek performans elde etmek artık mümkün.',
    category: 'Yapay Zeka',
    tags: ['yapay-zeka', 'llm', 'makine-ogrenmesi'],
  },
  {
    title: 'Clean Code: Okunabilir Kod Yazmanın 10 Altın Kuralı',
    content: 'Robert C. Martin\'in "Clean Code" kitabından ilham alan bu yazıda, profesyonel yazılım geliştiricilerinin uyguladığı en önemli prensipleri ele alacağız.\n\n1. Anlamlı İsimler Kullanın: Değişken, fonksiyon ve sınıf isimleri ne yaptıklarını açıklamalıdır.\n2. Fonksiyonlar Tek İş Yapmalı: Her fonksiyon yalnızca bir sorumluluğa sahip olmalıdır (Single Responsibility Principle).\n3. Kısa Fonksiyonlar Yazın: İdeal fonksiyon uzunluğu 20 satırın altında olmalıdır.\n4. Yorum Satırlarını Minimumda Tutun: İyi kod kendini açıklar.\n5. DRY Prensibini Uygulayın: "Don\'t Repeat Yourself" — tekrarlayan kodu fonksiyona taşıyın.\n\nBu prensipleri uygulamak başlangıçta zaman alsa da uzun vadede bakım maliyetini ciddi ölçüde düşürür.',
    category: 'Yazılım',
    tags: ['clean-code', 'best-practices', 'yazilim-muhendisligi'],
  },
  {
    title: 'Node.js ile RESTful API Tasarımı',
    content: 'Modern web uygulamalarının omurgasını oluşturan REST API\'ler, doğru tasarlandığında hem güvenli hem de ölçeklenebilir sistemler inşa etmenizi sağlar.\n\nExpress.js ile hızlıca bir API oluşturabilirsiniz. Temel endpoint\'ler GET, POST, PUT ve DELETE HTTP metodlarını kullanır. Her endpoint belirli bir kaynağı temsil etmeli ve HTTP status code\'larını doğru kullanmalıdır.\n\nJWT (JSON Web Token) ile kimlik doğrulama, günümüz API\'lerinde en yaygın kullanılan yöntemdir. Kullanıcı giriş yaptığında oluşturulan token, sonraki isteklerde Authorization header\'ında iletilir.\n\nMongoDB ile birlikte kullanılan Node.js, hızlı prototip geliştirme ve ölçeklenebilir backend çözümleri için ideal bir kombinasyondur.',
    category: 'Yazılım',
    tags: ['nodejs', 'api', 'backend', 'express'],
  },
  {
    title: 'CSS Grid ve Flexbox: Modern Layout Teknikleri',
    content: 'Web tasarımında layout oluşturmak artık çok daha kolay ve güçlü. CSS Grid ve Flexbox, karmaşık sayfa düzenlerini minimal kod ile gerçekleştirmenizi sağlar.\n\nFlexbox, tek boyutlu düzenler için idealdir. Yatay veya dikey eksende elemanları hizalamak, boşluk dağıtmak ve sıralamak kolaylaşır. justify-content ve align-items özellikleri ile elementleri merkeze almak artık birkaç satır kod meselesi.\n\nCSS Grid ise iki boyutlu düzenler için tasarlanmıştır. Satır ve sütunları aynı anda kontrol edebilir, karmaşık sayfa şablonları oluşturabilirsiniz. grid-template-areas özelliği ile görsel olarak layout tanımlamak mümkündür.',
    category: 'Teknoloji',
    tags: ['css', 'web-tasarim', 'frontend'],
  },
  {
    title: 'TypeScript Neden Bu Kadar Popüler?',
    content: 'TypeScript, Microsoft tarafından geliştirilen ve JavaScript\'e statik tip sistemi ekleyen bir programlama dilidir. Son yıllarda frontend ve backend geliştirmede standart haline gelmeye başladı.\n\nTipler sayesinde hataları derleme aşamasında yakalayabilirsiniz. Bu, runtime\'da ortaya çıkabilecek birçok hatanın önüne geçer. Özellikle büyük takımlarda çalışırken kod kalitesini ve bakım süreçlerini iyileştirir.\n\nIDE desteği de TypeScript\'in en büyük avantajlarından biridir. Otomatik tamamlama, tip kontrolü ve refactoring araçları geliştirici deneyimini önemli ölçüde artırır.\n\nReact, Next.js, Node.js gibi ekosistemde TypeScript artık varsayılan tercih haline geldi.',
    category: 'Yazılım',
    tags: ['typescript', 'javascript', 'programlama'],
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
  console.log('🔑 Giriş yapılıyor...');
  const loginRes = await request('POST', '/auth/login', { email, password });
  if (loginRes.status !== 200) {
    console.error('❌ Giriş başarısız:', loginRes.body?.message || loginRes.body);
    process.exit(1);
  }
  const { token, user } = loginRes.body;
  console.log(`✅ Giriş başarılı: ${user.firstName} ${user.lastName}`);

  for (const post of POSTS) {
    const res = await request('POST', '/posts', { ...post, authorId: user._id }, token);
    if (res.status === 200 || res.status === 201) {
      console.log(`✅ "${post.title}" eklendi`);
    } else {
      console.log(`⚠️  "${post.title}" eklenemedi:`, res.body?.message || res.status);
    }
  }
  console.log('\n🎉 Tamamlandı! Uygulamayı yenile.');
}

main().catch(console.error);
