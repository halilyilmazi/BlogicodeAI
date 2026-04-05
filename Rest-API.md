# REST API — BlogicodeAI

**Canlı REST API tabanı:** `https://blogicode-ai.vercel.app/api`

**Yerel geliştirme:** `http://127.0.0.1:3000/api`

---

## Endpoint özeti

Tüm yollar aşağıdaki taban adresine göredir: `{BASE}/...` → örn. `POST https://blogicode-ai.vercel.app/api/auth/register`

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/health` | API ayakta mı |
| POST | `/auth/register` | Kayıt |
| POST | `/auth/login` | Giriş |
| GET | `/users/:id` | Profil + kullanıcının yazıları |
| PUT | `/users/:id` | Profil güncelle |
| DELETE | `/users/:id` | Hesap sil (yazılar + ilgili yorumlar silinir) |
| GET | `/users` | Tüm kullanıcılar (admin listesi; şifre dönmez) |
| GET | `/users/:id/favorites` | Kullanıcının favori yazıları |
| GET | `/users/:id/comments` | Kullanıcının yorumları (yazı başlığı ile) |
| GET | `/posts` | Yazı listesi (`?sort=recent|popular|oldest`, `?topic=...`, `?q=...`) |
| POST | `/posts` | Yeni yazı |
| PUT | `/posts/:id` | Yazı güncelle (body’de `authorId` zorunlu) |
| DELETE | `/posts/:id?authorId=` | Yazı sil |
| POST | `/posts/:id/react` | Beğeni / favori (`userId`, `action`: `like` \| `favorite`) |
| GET | `/posts/:id/comments` | Yazıya ait yorumlar |
| POST | `/posts/:id/comments` | Yorum ekle |
| DELETE | `/comments/:id?authorId=` | Yorum sil |
| POST | `/chatbot` | AI asistan |

---

## Request body örnekleri

### `POST /auth/register`

```json
{
  "firstName": "Halil",
  "lastName": "Yılmaz",
  "email": "ornek@mail.com",
  "password": "GuvenliSifre123"
}
```

### `POST /auth/login`

```json
{
  "email": "ornek@mail.com",
  "password": "GuvenliSifre123"
}
```

### `PUT /users/:id`

```json
{
  "firstName": "Halil",
  "lastName": "Yılmaz",
  "username": "@halil",
  "bio": "Kısa bio",
  "profession": "Öğrenci",
  "gender": "Erkek",
  "birthDate": "2000-01-15",
  "profilePhoto": "https://..."
}
```

### `POST /posts`

```json
{
  "title": "Başlık",
  "content": "İçerik",
  "category": "Yazılım",
  "authorId": "KULLANICI_MONGODB_ID",
  "tags": ["etiket1"]
}
```

### `PUT /posts/:id`

```json
{
  "title": "Güncel başlık",
  "content": "Güncel içerik",
  "category": "Yapay zeka",
  "authorId": "KULLANICI_MONGODB_ID"
}
```

### `POST /posts/:id/react`

```json
{
  "userId": "KULLANICI_MONGODB_ID",
  "action": "like"
}
```

### `POST /posts/:id/comments`

```json
{
  "content": "Yorum metni",
  "authorId": "KULLANICI_MONGODB_ID"
}
```

### `POST /chatbot`

```json
{
  "message": "Merhaba",
  "history": []
}
```

---

## Üye sayfaları (görev / teslim)

1. [Halil Yılmaz — REST API görevleri ve video](Halil-Yılmaz/Halil-Yılmaz-Rest-API-Gorevleri.md)

---

## Postman koleksiyonu (dışa aktarım)

- Halil Yılmaz: [`Halil-Yılmaz/postman/Halil-Yilmaz-BlogicodeAI.postman_collection.json`](Halil-Yılmaz/postman/Halil-Yilmaz-BlogicodeAI.postman_collection.json)
