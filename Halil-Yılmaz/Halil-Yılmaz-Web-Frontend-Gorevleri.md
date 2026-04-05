# Halil Yılmaz — Web Frontend

**Video linki : [https://youtu.be/GPNGHeMwLbo](https://youtu.be/GPNGHeMwLbo)


---

## Gereksinim ↔ sayfa / ekran

| # | Gereksinim | Ön yüz dosyası / akış |
|---|------------|------------------------|
| 1 | Kayıt olma | `index.html` (modal), `login.html` |
| 2 | Giriş yapma | `index.html` (modal), `login.html` |
| 3 | Profil görüntüleme | `panel.html` → «Profil bilgilerim» (veriler `GET /api/users/:id`) |
| 4 | Profil güncelleme | `panel.html` → Kaydet → `PUT /api/users/:id` |
| 5 | Hesap silme | `panel.html` → «Hesabımı sil» → `DELETE /api/users/:id` |
| 6 | Yazı oluşturma | `home.html` → `POST /api/posts` |
| 7 | Yazıları listeleme | `index.html` (Keşfet), `home.html` → `GET /api/posts` |
| 8 | Yazı silme | `panel.html`, `home.html` → `DELETE /api/posts/:id` |
| 9 | Yorum ekleme | `index.html`, `home.html` → `POST /api/posts/:id/comments` |
| 10 | Yorum silme | `panel.html` → «Yorumlarım» → `DELETE /api/comments/:id` |
| 11 | AI asistan | `chatbot.html` → `POST /api/chatbot` |

---

## Video altı — kısa detay (her madde)

1. **Kayıt:** Modal veya `login.html` kayıt sekmesi; başarı/hata mesajı.  
2. **Giriş:** `localStorage`’a `userId` yazılır; Keşfet güncellenir.  
3. **Profil görüntüleme:** Panelde alanların API’den dolması.  
4. **Profil güncelleme:** Kaydet sonrası başarı mesajı.  
5. **Hesap silme:** Onay modalı → çıkış → `index.html`.  
6. **Yazı oluşturma:** Form gönderimi, liste yenilenmesi.  
7. **Liste:** Keşfet sıralama / arama / kategori.  
8. **Yazı silme:** Yalnızca yazar için sil butonu.  
9. **Yorum:** Giriş yapmış kullanıcı için yorum alanı.  
10. **Yorum silme:** Panelde kendi yorumunu silme.  
11. **Asistan:** Mesaj gönderme; `200` ve `reply` (Gemini veya yerel mod).

---

*Video girişi örneği: “Ben Halil Yılmaz; web tarafında 11 gereksinimin tamamını bağladım.” (Grup çalışmasıysa sadece kendi frontend payını söyle.)*
