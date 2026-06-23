# Halil Yılmaz'ın Mobil Frontend Görevleri

**Platform:** React Native (Expo) + TypeScript  
**Proje Konumu:** `Halil-Yılmaz/mobile/`  
**Expo SDK:** ~56.0.12  

---

## Uygulama Ekranları ve Navigasyon

### Navigasyon Yapısı
```
Stack Navigator (Root)
├── LoginScreen        (Giriş Yap)
├── RegisterScreen     (Kayıt Ol)
└── MainTabs (Bottom Tab Navigator)
    ├── HomeScreen         (Keşfet - Blog Akışı)
    ├── CreatePostScreen   (Yaz - Yeni Yazı)
    ├── ChatbotScreen      (AI Asistan)
    └── ProfileScreen      (Profil)
        └── EditProfileScreen  (Profili Düzenle — Stack)
        └── PostDetailScreen   (Yazı Detay — Stack)
```

---

## 1. Üye Olma (Kayıt) Ekranı — `RegisterScreen.tsx`
- **API Endpoint:** `POST /auth/register`
- **UI Bileşenleri:**
  - Ad / Soyad input (yan yana, satır düzeni)
  - Email input (keyboard type: email)
  - Şifre input (secure text entry + göz ikonu)
  - Şifre tekrar input
  - Şifre güç göstergesi (5 segmentli renk çubuğu: Zayıf / Orta / Güçlü)
  - "Kayıt Ol" butonu (disabled — tüm alanlar dolmadan)
  - "Zaten hesabınız var mı? Giriş Yap" linki
  - Loading indicator (kayıt sırasında)
- **Form Validasyonu:**
  - Email format kontrolü (real-time)
  - Şifre: min 8 karakter, büyük harf, rakam
  - Şifre eşleşme kontrolü
  - Ad/soyad boş olamaz
- **UX:**
  - Hata mesajları alan altında (kırmızı)
  - ScrollView + KeyboardAvoidingView
  - 409 Conflict → "Bu email zaten kullanılıyor"

---

## 2. Giriş Yapma Ekranı — `LoginScreen.tsx`
- **API Endpoint:** `POST /auth/login`
- **UI Bileşenleri:**
  - Email / Şifre input
  - Göz ikonu (şifre göster/gizle)
  - "Giriş Yap" butonu
  - "Hesabınız yok mu? Kayıt Ol" linki
  - Loading indicator
- **UX:**
  - Real-time alan validasyonu
  - Hatalı giriş için Alert

---

## 3. Blog Akışı (Ana Sayfa) — `HomeScreen.tsx`
- **API Endpoint:** `GET /posts`
- **UI Bileşenleri:**
  - Arama çubuğu (live search)
  - Sıralama filtreleri: Yeni / Popüler / Eski (yatay scroll chip)
  - Kategori filtreleri: Tümü / Yazılım / Yapay Zeka / Teknoloji / İnovasyon
  - Blog yazısı kartları (FlatList):
    - Kategori badge + tarih
    - Başlık + içerik önizleme
    - Yazar avatarı + adı + beğeni/favori sayısı
  - Pull-to-refresh
  - Loading indicator / Empty state / Error state (Retry butonu)
- **UX:**
  - Yazıya tıklayınca PostDetailScreen'e git
  - Smooth scroll, lazy loading

---

## 4. Yazı Detay Ekranı — `PostDetailScreen.tsx`
- **API Endpoint:** `GET /posts/:id/comments`, `POST /posts/:id/react`, `DELETE /posts/:id`
- **UI Bileşenleri:**
  - Kategori badge + tarih
  - Başlık + yazar bilgisi (avatar + isim)
  - Etiket listesi
  - Yazı içeriği (tam metin)
  - Beğeni butonu (toggle, sayaçlı)
  - Yorumlar bölümü:
    - Yorum ekleme alanı + Gönder butonu
    - Yorum kartları (yazar, tarih, içerik, sil butonu)
  - Yazar ise → Yazıyı Sil butonu
- **UX:**
  - KeyboardAvoidingView (yorum yazarken)
  - Kendi yorumlarını silebilme (onay dialog'u)
  - Yazıyı sil → Ana sayfaya dön

---

## 5. Yeni Yazı Oluşturma — `CreatePostScreen.tsx`
- **API Endpoint:** `POST /posts`
- **UI Bileşenleri:**
  - Başlık input (max 150 karakter, sayaç)
  - Kategori seçici (yatay scroll chip)
  - İçerik alanı (multiline, min 50 karakter)
  - Etiket ekleme (max 5, badge ile gösterim, tıklayınca kaldır)
  - "Yayınla" butonu (disabled — validasyon geçmeden)
- **Form Validasyonu:**
  - Başlık min 5 karakter
  - İçerik min 50 karakter
- **UX:**
  - Başarılı yayın → Alert + form sıfırlanır

---

## 6. Kullanıcı Profil Görüntüleme — `ProfileScreen.tsx`
- **API Endpoint:** `GET /users/{id}`
- **UI Bileşenleri:**
  - Avatar (baş harfler, mor çember)
  - Ad, soyad, kullanıcı adı, biyografi
  - Email, meslek, katılım tarihi (ikonlu)
  - "Profili Düzenle" butonu + "Çıkış Yap" ikonu
  - Kullanıcının yazıları (kart listesi, sil butonu)
  - "Hesabı Kalıcı Olarak Sil" butonu (kırmızı, alt kısım)
  - Pull-to-refresh
- **UX:**
  - Loading / Error / Empty state
  - Çıkış için onay dialog'u

---

## 7. Profil Düzenleme — `EditProfileScreen.tsx`
- **API Endpoint:** `PUT /users/{id}`
- **UI Bileşenleri:**
  - Ad / Soyad (zorunlu)
  - Kullanıcı adı, meslek, telefon, biyografi (opsiyonel)
  - Email → salt okunur (değiştirilemez)
  - "Kaydet" butonu (sağ üst, değişiklik olmadan disabled)
  - "X" (iptal) butonu (sol üst)
  - Karakter sayacı (biyografi, max 200)
- **UX:**
  - Değişiklik yokken "Kaydet" disabled
  - İptal + değişiklik varsa → "Değişiklikler kaydedilmedi" onay dialog'u
  - Başarılı güncelleme → Alert + geri dön

---

## 8. Hesap Silme Akışı — `ProfileScreen.tsx` içinde
- **API Endpoint:** `DELETE /users/{id}`
- **Akış (çift onay):**
  1. "Hesabı Kalıcı Olarak Sil" butonuna basılır
  2. Alert 1: "Hesabınızı silmek istediğinize emin misiniz?"
  3. Alert 2: "Tüm yazılar ve yorumlar silinecek, devam edilsin mi?"
  4. API çağrısı → Başarılı → signOut() → Login ekranına dönüş
- **UX:**
  - Kırmızı renkli destructive buton
  - İki aşamalı onay mekanizması

---

## 9. AI Asistan (Chatbot) — `ChatbotScreen.tsx`
- **API Endpoint:** `POST /chatbot`
- **UI Bileşenleri:**
  - Bot bilgi çubuğu (avatar, isim, durum)
  - Mesaj baloncukları (kullanıcı sağ, bot sol)
  - Öneri butonları (ilk açılışta 4 adet)
  - Metin giriş alanı + Gönder butonu
  - "Yanıt yazılıyor..." indikatörü
- **UX:**
  - Mesaj gönderilince otomatik scroll aşağı
  - Öneri butonuna basınca direkt mesaj gönderilir
  - Hata durumunda bot olarak hata mesajı gösterilir

---

## Kullanılan Kütüphaneler

| Kütüphane | Amaç |
|-----------|------|
| `@react-navigation/native` + `native-stack` + `bottom-tabs` | Sayfa navigasyonu |
| `axios` | HTTP istekleri |
| `@react-native-async-storage/async-storage` | Token/kullanıcı saklama |
| `@expo/vector-icons` (Ionicons) | İkonlar |
| `expo-status-bar` | Durum çubuğu |
| `react-native-safe-area-context` | Güvenli alan (notch, çentik) |
| `react-native-screens` | Native ekran performansı |

---

## Genel Frontend Prensipleri Uygulaması

- **Renk Paleti:** `#0f172a` (arka plan), `#1e293b` (kart), `#6366f1` (primary), `#e2e8f0` (metin)
- **Tipografi:** System font, okunabilir boyutlar (12–24px arası hiyerarşi)
- **Loading States:** ActivityIndicator ve skeleton-benzeri boş durumlar
- **Error Handling:** Alert dialog + retry butonu
- **Empty States:** İkon + açıklayıcı metin
- **Feedback:** Alert, disabled buton, real-time validasyon
- **Erişilebilirlik:** Minimum 44dp dokunma alanı, yüksek kontrast
- **Keyboard Handling:** KeyboardAvoidingView + ScrollView her form ekranında

---

## Kanıt Videosu

**Gereksinim:** Mobil Frontend (React Native Expo)

> Videoda Halil Yılmaz adını ve gereksinim adını söyleyerek uygulamayı Expo Go üzerinden gösterir.
> Tüm ekranlar arası geçiş, form validasyonu, loading state ve error handling gösterilmelidir.

**Video Linki:** [Video linki buraya eklenecek]
