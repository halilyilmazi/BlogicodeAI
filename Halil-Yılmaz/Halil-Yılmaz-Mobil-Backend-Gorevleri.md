# Halil Yılmaz'ın Mobil Backend Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

**REST API Adresi:** `https://blogicode-ai.vercel.app/api`  
**HTTP Client:** Axios (interceptor ile JWT token yönetimi)  
**Dosya Konumu:** `Halil-Yılmaz/mobile/src/api/`

---

## HTTP Client Yapılandırması — `src/api/client.ts`
- **Base URL:** `https://blogicode-ai.vercel.app/api`
- **Timeout:** 30 saniye
- **Request Interceptor:** AsyncStorage'dan JWT token okur, `Authorization: Bearer {token}` header'ı ekler
- **Response Interceptor:** API hata mesajlarını normalize eder (`.data.message` veya `.data.error`)

---

## 1. Üye Olma (Kayıt) Servisi — `src/api/auth.ts`
- **Endpoint:** `POST /auth/register`
- **İşlevler:**
  - `register(payload)` → `{firstName, lastName, email, password}` → `AuthResponse`
  - Başarılı → `AuthContext.signIn(user, token)` çağrılır
  - Token + kullanıcı AsyncStorage'a kaydedilir
  - Stack navigator otomatik `MainTabs`'a geçer
- **Hata Yönetimi:**
  - `409 Conflict` → "Bu email zaten kullanılıyor"
  - `400 Bad Request` → validasyon hatası mesajı
  - Network hatası → "Bir hata oluştu"

---

## 2. Giriş Yapma Servisi — `src/api/auth.ts`
- **Endpoint:** `POST /auth/login`
- **İşlevler:**
  - `login(payload)` → `{email, password}` → `AuthResponse`
  - Token + kullanıcı AsyncStorage'a kaydedilir
  - Başarılı → MainTabs'a yönlendirme
- **Uygulama Başlangıcı:**
  - `AuthContext` uygulama açılışında AsyncStorage'ı kontrol eder
  - Token varsa direkt MainTabs'a gider (otomatik giriş)

---

## 3. Kullanıcı Profil Görüntüleme Servisi — `src/api/users.ts`
- **Endpoint:** `GET /users/{id}`
- **İşlevler:**
  - `getUser(id)` → `{user, posts}`
  - Bearer token header ile kimlik doğrulama
  - Kullanıcı yazıları da aynı yanıtta döner
- **Hata Yönetimi:**
  - `401 Unauthorized` → signOut() + Login ekranına dön
  - `404 Not Found` → "Kullanıcı bulunamadı"
  - Network hatası → Retry butonu

---

## 4. Kullanıcı Güncelleme Servisi — `src/api/users.ts`
- **Endpoint:** `PUT /users/{id}`
- **İşlevler:**
  - `updateUser(id, payload)` → güncellenmiş kullanıcı nesnesi
  - `AuthContext.updateUser()` ile local state güncellenir
  - AsyncStorage'daki kullanıcı verisi güncellenir
- **Payload:** `firstName`, `lastName`, `username`, `bio`, `profession`, `phone`

---

## 5. Kullanıcı Silme Servisi — `src/api/users.ts`
- **Endpoint:** `DELETE /users/{id}`
- **İşlevler:**
  - `deleteUser(id)` → hesap silinir
  - `AuthContext.signOut()` → token + kullanıcı verisi temizlenir
  - Stack navigator Login ekranına döner
- **Güvenlik:** İki aşamalı onay dialog'u

---

## 6. Blog Yazısı Listeleme Servisi — `src/api/posts.ts`
- **Endpoint:** `GET /posts`
- **İşlevler:**
  - `getPosts(params)` → `{posts: Post[]}`
  - Parametreler: `sort` (recent/popular/oldest), `topic`, `q` (arama)
  - Dinamik filtreleme — HomeScreen state'i değişince refetch

---

## 7. Blog Yazısı Oluşturma Servisi — `src/api/posts.ts`
- **Endpoint:** `POST /posts`
- **İşlevler:**
  - `createPost(payload)` → yeni `Post` nesnesi
  - Payload: `title`, `content`, `category`, `authorId`, `tags`
  - `authorId` AuthContext'ten alınır

---

## 8. Blog Yazısı Silme Servisi — `src/api/posts.ts`
- **Endpoint:** `DELETE /posts/{id}?authorId=`
- **İşlevler:**
  - `deletePost(id, authorId)` → yazı silinir
  - HomeScreen ve ProfileScreen'deki local list güncellenir
  - PostDetailScreen'den → goBack()

---

## 9. Beğeni / Favori Servisi — `src/api/posts.ts`
- **Endpoint:** `POST /posts/{id}/react`
- **İşlevler:**
  - `reactToPost(id, userId, action)` → güncellenmiş `Post`
  - `action`: `"like"` veya `"favorite"`
  - Optimistic UI update (basılınca anında sayaç değişir)

---

## 10. Yorum Servisleri — `src/api/comments.ts`
- **Yorum Listeleme:** `GET /posts/{id}/comments` → `getComments(postId)`
- **Yorum Ekleme:** `POST /posts/{id}/comments` → `addComment(postId, authorId, content)`
- **Yorum Silme:** `DELETE /comments/{id}?authorId=` → `deleteComment(commentId, authorId)`
- Sadece kendi yorumunu silebilme (authorId karşılaştırması)

---

## 11. AI Chatbot Servisi — `src/api/chatbot.ts`
- **Endpoint:** `POST /chatbot`
- **İşlevler:**
  - `sendMessage(message)` → `{reply: string}`
  - Mesaj geçmişi sadece local state'te tutulur (API'ye gönderilmez)
  - Hata durumunda bot mesajı olarak hata gösterilir

---

## Authentication Yönetimi — `src/context/AuthContext.tsx`

| İşlev | Açıklama |
|-------|---------|
| `signIn(user, token)` | Token + kullanıcıyı AsyncStorage ve state'e kaydeder |
| `signOut()` | AsyncStorage temizler, state sıfırlar, Login'e yönlendirir |
| `updateUser(user)` | Local state ve AsyncStorage'ı günceller |
| Uygulama başlangıcı | AsyncStorage kontrol, token varsa otomatik giriş |

---

## Genel Backend Prensipleri Uygulaması

- **Timeout:** 30 saniye (request timeout)
- **Authentication:** Her istekte Bearer token header otomatik eklenir
- **Error Normalization:** Tüm API hataları kullanıcı dostu Türkçe mesajlara dönüştürülür
- **Token Persistence:** Uygulama kapatılıp açıldığında oturum korunur
- **Secure Storage:** Token AsyncStorage'da (production için expo-secure-store'a geçilebilir)

---

## Kanıt Videosu

**Gereksinim:** Mobil Backend — REST API Entegrasyonu

> Videoda Halil Yılmaz adını ve gereksinim adını söyleyerek API isteklerini gösterir.
> Login isteğinin gidişi ve JWT token'ın döndüğü, ardından korunan endpoint'lere Authorization header ile istek atıldığı görülmelidir.
> Network sekmesinde (veya console log'da) request ve response açıkça görünmelidir.

**Video Linki:** [Video linki buraya eklenecek]
