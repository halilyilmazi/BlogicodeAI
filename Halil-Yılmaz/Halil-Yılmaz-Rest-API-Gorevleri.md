# Halil Yılmaz — REST API (teslim sayfası)

## YouTube — Postman + canlı domain kanıtı

**Video linki (buraya kendi videonu yapıştır):** [YouTube’da aç](https://www.youtube.com/watch?v=VIDEO_ID_BURAYA)

Videoda göster:

- Tarayıcıda **Postman**; koleksiyon adı ve **canlı domain** (`{{baseUrl}}` veya tam URL) adres çubuğunda görünsün.
- En az bir **POST** ve bir **GET** isteği; **Tests** sekmesinde veya Test sonuçları panelinde **yeşil** onaylar.
- İsteğe bağlı: `Register` / `Login` sonrası `userId` değişkeninin dolması.

**Postman koleksiyonu (JSON):** [`postman/Halil-Yilmaz-BlogicodeAI.postman_collection.json`](postman/Halil-Yilmaz-BlogicodeAI.postman_collection.json)

---

## Canlı API tabanı

**Üretim:** `https://blogicode-ai.vercel.app/api`  
**Yerel:** `http://127.0.0.1:3000/api`

Koleksiyonda `baseUrl` değişkenini buna göre ayarla.

---

## Gereksinim ↔ API (11 madde)

| # | Gereksinim | Metot | Yol |
|---|------------|-------|-----|
| 1 | Kayıt olma | POST | `/api/auth/register` |
| 2 | Giriş yapma | POST | `/api/auth/login` |
| 3 | Profil görüntüleme | GET | `/api/users/:id` |
| 4 | Profil güncelleme | PUT | `/api/users/:id` |
| 5 | Hesap silme | DELETE | `/api/users/:id` |
| 6 | Blog yazısı oluşturma | POST | `/api/posts` |
| 7 | Blog yazılarını listeleme | GET | `/api/posts` |
| 8 | Blog yazısı silme | DELETE | `/api/posts/:id?authorId=` |
| 9 | Yorum ekleme | POST | `/api/posts/:id/comments` |
| 10 | Yorum silme | DELETE | `/api/comments/:id?authorId=` |
| 11 | AI asistan | POST | `/api/chatbot` |

---

## Detaylı uç noktalar (Halil — proje ile uyumlu)

Aşağıdaki yollar `{BASE}` = `https://blogicode-ai.vercel.app/api` (veya yerel `/api`).

### 1. Kayıt — `POST {BASE}/auth/register`

**Body (JSON):**

```json
{
  "firstName": "Halil",
  "lastName": "Yılmaz",
  "email": "halil.test@example.com",
  "password": "Test123456"
}
```

**Yanıt:** `201` — `user` içinde `_id` (şifre dönmez).

---

### 2. Giriş — `POST {BASE}/auth/login`

```json
{
  "email": "halil.test@example.com",
  "password": "Test123456"
}
```

**Yanıt:** `200` — `token`, `user` (`_id` ile devam edilir).

---

### 3. Profil görüntüleme — `GET {BASE}/users/:id`

Path: MongoDB kullanıcı `_id`.  
**Yanıt:** `200` — `user`, `posts` (kullanıcının yazıları).

---

### 4. Profil güncelleme — `PUT {BASE}/users/:id`

```json
{
  "username": "@halil",
  "bio": "BlogicodeAI",
  "firstName": "Halil",
  "lastName": "Yılmaz",
  "profession": "Öğrenci",
  "gender": "Belirtmek İstemiyorum",
  "birthDate": "2000-01-01",
  "profilePhoto": ""
}
```

**Yanıt:** `200`

---

### 5. Hesap silme — `DELETE {BASE}/users/:id`

**Yanıt:** `204` — kullanıcı yazıları ve ilgili yorumlar temizlenir.

---

### 6. Yazı oluşturma — `POST {BASE}/posts`

```json
{
  "title": "Test yazısı",
  "content": "İçerik",
  "category": "Yazılım",
  "authorId": "KULLANICI_ID",
  "tags": ["test"]
}
```

**Yanıt:** `201`

---

### 7. Yazıları listeleme — `GET {BASE}/posts`

Örnek: `GET {BASE}/posts?sort=recent&q=test`

**Yanıt:** `200` — `{ "data": [ ... ] }`

---

### 8. Yazı silme — `DELETE {BASE}/posts/:id?authorId=KULLANICI_ID`

**Yanıt:** `204`

---

### 9. Yorum ekleme — `POST {BASE}/posts/:postId/comments`

```json
{
  "content": "Harika yazı",
  "authorId": "KULLANICI_ID"
}
```

**Yanıt:** `201`

---

### 10. Yorum silme — `DELETE {BASE}/comments/:commentId?authorId=KULLANICI_ID`

**Yanıt:** `204`

---

### 11. AI asistan — `POST {BASE}/chatbot`

```json
{
  "message": "Merhaba",
  "history": []
}
```

**Yanıt:** `200` — `reply`, `source` (`gemini` veya `fallback`).

---

## Ek (ödev kapsamı dışı opsiyonel)

- `GET /api/health` — sağlık kontrolü  
- `PUT /api/posts/:id`, `POST /api/posts/:id/react`, `GET /api/users/:id/favorites` — uygulama özellikleri  

---

*Video girişinde örnek cümle: “Ben Halil Yılmaz; Gereksinim Analizi’ndeki 11 maddenin tamamını bu projede uyguladım.” (Grup çalışmasıysa kendi payını söyle.)*
