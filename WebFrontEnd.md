# Web Frontend — BlogicodeAI

**Web Frontend Adresi:**  [https://www.blogicodeai.com]

**Frontend Test Videosu:** [https://youtu.be/GPNGHeMwLbo]

---

## Web Frontend Görev Dağılımı

Bu dokümanda, web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir.

---

## Üyelerin Web Frontend Görevleri

1. [Halil Yılmaz'ın Web Frontend Görevleri](Halil-Yılmaz/Halil-Yılmaz-Web-Frontend-Gorevleri.md)

---

## 1. Üye Olma (Kayıt) Sayfası
* **API Endpoint:** `POST /api/auth/register`
* **Görev:** Yeni kullanıcıların sisteme güvenli bir şekilde dahil edilmesini sağlayan, mobil öncelikli (mobile-first) ve tamamen duyarlı (responsive) web sayfası tasarımı.
* **UI/UX Bileşenleri:**
    * Responsive kayıt formu (Masaüstü için ortalanmış Card layout, mobil için tam ekran esnek yapı).
    * Kullanıcı adı (Username) input alanı (Alfanumerik karakterleri destekleyen, anlık kontrol sağlayan).
    * Email input alanı (`type="email"`, `autocomplete="email"` ve erişilebilirlik için `aria-label` eklentileri).
    * Şifre input alanı (`type="password"`) ve "Şifreyi Göster/Gizle" (göz ikonu) toggle butonu.
    * Dinamik Şifre Gücü Göstergesi (Zayıf/Orta/Güçlü - renkli progress bar ile).
    * "Hizmet Şartlarını Kabul Ediyorum" onay kutusu (Checkbox).
    * "Kayıt Ol" butonu (Primary button style, hover ve active state animasyonları ile).
    * "Zaten hesabınız var mı? Giriş Yap" yönlendirme linki.
* **Form Validasyonu & Hata Yönetimi:**
    * **Client-side:** HTML5 validation, özel Regex ile email format kontrolü. Şifre için minimum 8 karakter, en az bir büyük harf ve bir rakam zorunluluğu (Yup, Zod veya React Hook Form gibi kütüphanelerle desteklenebilir).
    * **Server-side:** API'den dönen `400 Bad Request` veya `409 Conflict` (Email/Kullanıcı Adı zaten kullanımda) hatalarının yakalanıp ilgili input'un altında kırmızı uyarı metni (inline error) olarak gösterilmesi.
* **Süreç Deneyimi (UX):**
    * İstek atıldığı an butonun `disabled` edilmesi (Double-click / çoklu istek koruması) ve buton içinde "Yükleniyor..." (Loading spinner) gösterimi.
    * Başarılı kayıt sonrası (HTTP `201 Created`) kullanıcının otomatik olarak Login sayfasına yönlendirilmesi ve ekranın sağ üst köşesinde başarı mesajı (Toast/Snackbar notification) gösterilmesi.

---

## 2. Giriş (Login) Sayfası ve JWT Yönetimi
* **API Endpoint:** `POST /api/auth/login`
* **Görev:** Güvenli kimlik doğrulama (Authentication) akışı ve JSON Web Token (JWT) tabanlı oturum yönetiminin sağlanması.
* **UI/UX Bileşenleri:**
    * Email input (`type="email"`).
    * Şifre input (`type="password"`) ve "Şifremi Unuttum" linki.
    * "Beni Hatırla" (Remember me) onay kutusu.
    * "Giriş Yap" butonu (Yükleme state'i ile entegre).
* **Form Validasyonu & Hata Yönetimi:**
    * Client-side boş alan kontrolleri.
    * API'den dönen `401 Unauthorized` veya `404 Not Found` durumlarında "Hatalı e-posta veya şifre" şeklinde güvenlik odaklı, genel bir uyarı mesajı verilmesi (Kötü niyetli kişilere hangi bilginin yanlış olduğunu açık etmemek için).
* **Teknik Detaylar ve Güvenlik (Token Yönetimi):**
    * Başarılı giriş (HTTP `200 OK`) sonrasında backend'den dönen Access Token (örneğin dinamik JWT), kullanıcının tercihine göre ("Beni Hatırla" seçiliyse) `localStorage` alanına, seçili değilse `sessionStorage` alanına kaydedilir.
    * **Axios Interceptor / Fetch Wrapper:** Sonraki tüm korumalı (protected) API isteklerinde bu token, HTTP başlığında (Header) otomatik olarak `Authorization: Bearer <token>` formatında eklenir.
    * Token süresi (Expiration) dolduğunda uygulamanın kullanıcıyı sessizce çıkış (Logout) işlemine sokup tekrar Login sayfasına yönlendirmesi (`401` hata yakalama akışı).

---

## 3. Blog Yazıları Listeleme (Ana Sayfa)
* **API Endpoint:** `GET /api/posts` (Opsiyonel query parametreleri: `?page=1&limit=10&sort=desc`)
* **Görev:** Veritabanındaki tüm blog yazılarını (makaleleri) performanslı ve kullanıcı dostu bir şekilde listeleme.
* **UI/UX Bileşenleri:**
    * Responsive CSS Grid veya Flexbox tabanlı modern kart görünümü.
    * Her blog kartında: Kapak görseli (Thumbnail), Başlık (H2/H3), kısa özet metni (Truncated content - örn. max 100 karakter), yazar avatarı/ismi ve "3 gün önce" formatında okunabilir oluşturulma tarihi (Time-ago format).
    * "Devamını Oku" butonu veya kartın tamamının tıklanabilir (clickable) olması.
    * Kategori veya etiket (Tag) bazlı filtreleme butonları.
* **Kullanıcı Deneyimi & Performans:**
    * Veriler API'den çekilirken ekranın zıplamasını önlemek için "Skeleton Loader" (iskelet yükleme animasyonu) gösterimi.
    * Eğer veritabanında hiç yazı yoksa, şık bir illüstrasyon eşliğinde "Henüz blog yazısı bulunmamaktadır" (Empty State) ekranı.
    * Çok fazla yazı olduğunda Sayfalama (Pagination) veya sayfa altına inildikçe yüklenen Sonsuz Kaydırma (Infinite Scroll) mekanizması.
* **Teknik Detaylar:**
    * Bu endpoint public (açık) olduğu için Authorization header gerektirmez. İstekler önbelleklenebilir (Caching).

---

## 4. Blog Yazısı Oluşturma Sayfası
* **API Endpoint:** `POST /api/posts`
* **Görev:** Yalnızca sisteme giriş yapmış yetkili kullanıcıların yeni bir içerik üretmesini sağlayan, zengin metin destekli form arayüzü.
* **UI/UX Bileşenleri:**
    * Geniş ve dikkat dağıtmayan Başlık (Title) input alanı.
    * İçerik (Content) için Rich Text Editor (Örn: Quill.js, TipTap, CKEditor) veya Markdown destekli geniş metin alanı (`<textarea>`).
    * Kapak fotoğrafı yükleme alanı (Drag & Drop destekli file input).
    * "Taslak Olarak Kaydet" ve "Yayınla" butonları.
* **Teknik Detaylar (Güvenlik Guard'ı ve Veri İletimi):**
    * **Route Guarding (Koruma):** Frontend tarafında, kullanıcı bu URL'e girmek istediğinde router seviyesinde token kontrolü yapılır. Token yoksa veya geçersizse `403/401` mekanizması ile doğrudan Login sayfasına `?redirect=/create-post` parametresiyle yönlendirilir.
    * **Sanitization (XSS Koruması):** Rich Text Editor'den gelen HTML içeriği, zararlı script'leri engellemek adına DOMPurify gibi araçlarla temizlenerek (sanitize) backend'e gönderilir.
* **Akış:**
    * Form gönderildiğinde Bearer Token ile istek atılır. Başarılı işlem (HTTP `201`) sonucunda kullanıcıya "Yazınız başarıyla yayınlandı" toast mesajı gösterilir ve yeni yazının detay sayfasına (veya ana sayfaya) yönlendirilir.

---

## 5. Blog Yazısı Silme Akışı (Yetki Kontrollü)
* **API Endpoint:** `DELETE /api/posts/{postId}`
* **Görev:** Kullanıcının yalnızca kendi mülkiyetindeki (veya sistem admini yetkisine sahipse tüm) yazıları kalıcı olarak silebilme akışı.
* **UI/UX Bileşenleri:**
    * Yazı detay sayfasında veya kullanıcının kendi profilindeki blog kartlarında beliren "Sil" butonu (Kırmızı/Danger style ikon veya buton).
    * **Yıkıcı İşlem Koruması:** Kullanıcı butona tıkladığında işlemin geri alınamayacağını belirten bir Modal/Dialog (Örn: "Bu yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.") çıkar. İşlem ancak bu modal onaylanırsa başlar.
* **Kullanıcı Deneyimi ve Güvenlik:**
    * Frontend tarafında buton, giriş yapan kullanıcının ID'si ile makalenin Yazar ID'si eşleşiyorsa görünür (UI Level Security).
    * Eğer bir açık bulunup istek atılırsa, Backend `403 Forbidden` (Bu yazıyı silme yetkiniz yok) döner. Frontend bu hatayı yakalayıp kullanıcıya bildirir.
    * İşlem başarılıysa (HTTP `200`), sayfa yeniden yüklenmeden (Optimistic UI veya State filtreleme ile) silinen yazı DOM'dan anında kaldırılır.

---

## 6. AI Chatbot (Yapay Zeka Asistanı) Arayüzü
* **API Endpoint:** `POST /api/chatbot`
* **Görev:** Kullanıcıların sistem entegre yapay zeka asistanı ile doğal dilde etkileşime girdiği dinamik sohbet arayüzü.
* **UI/UX Bileşenleri:**
    * Yüzen (Floating) chat butonu veya sabit bir yan panel (Sidebar).
    * Sohbet geçmişini (kullanıcı ve AI baloncukları şeklinde) gösteren, yeni mesaj geldiğinde otomatik olarak en alta kayan (auto-scroll) alan.
    * Kullanıcı mesaj kutusu (Çok satırlı yazıya izin veren, enter ile gönderip shift+enter ile alt satıra inen textarea).
    * Mesaj beklerken üç noktalı "Yapay zeka düşünüyor..." (Typing indicator) animasyonu ve butonun disable edilmesi.
* **Veri İletimi ve Formatlama:**
    * Kullanıcı sorusu JSON formatında (`{ "prompt": "Kullanıcı mesajı..." }`) API'ye gönderilir.
    * AI'den gelen yanıt (HTTP `200`) genellikle Markdown formatında olacağı için, frontend tarafında bu metin `react-markdown` gibi bir kütüphane ile parse edilip kalın yazılar, listeler veya kod blokları (Syntax Highlighting ile) olarak ekrana basılır.
    * Timeout veya hata durumlarında (HTTP `400` veya `500`), "Şu anda bağlantı kurulamıyor, lütfen tekrar deneyin" şeklinde zarif bir hata balonu gösterilir.

---

## 7. Kullanıcı Profil ve Hesap Yönetimi
* **API Endpoints:**
    * `GET /api/users/profile` (Mevcut kullanıcı verilerini getirme)
    * `PUT /api/users/profile` (Kullanıcı bilgilerini güncelleme)
    * `DELETE /api/users/profile` (Kullanıcının kendi hesabını silmesi)
* **Görev:** Oturum açmış kullanıcının kendi kişisel bilgilerini, tercihlerini görüntülemesi ve yönetmesi.
* **UI/UX Bileşenleri:**
    * **Profil Görüntüleme:** Kullanıcı Avatarı, Ad/Soyad, Bio, Meslek ve istatistiklerin (Örn: Toplam yazılan makale) bulunduğu şık bir Dashboard.
    * **Profili Düzenle:** Form inputları ile bilgileri değiştirme alanı ve "Şifre Değiştir" (Mevcut şifre, yeni şifre onay) sekmesi.
    * **Tehlikeli Bölge (Danger Zone):** Hesabı kalıcı olarak silmeye yarayan, kırmızı çerçeveli alan.
* **Kullanıcı Deneyimi ve Akış:**
    * Profil düzenleme formunda sadece değişen veriler (dirty state) algılanıp backend'e gönderilir (Network optimizasyonu).
    * Hesap silme işlemi öncesi kesinlikle şifre sorulur veya e-posta onay kodu (Double Confirmation) istenir.
    * Hesap başarıyla silindikten sonra veya kullanıcı manuel "Çıkış Yap" (Logout) dediğinde; `localStorage` / `sessionStorage` temizlenir, global state (Redux/Context API) sıfırlanır ve kullanıcı Login sayfasına veya Ana sayfaya yönlendirilir.
