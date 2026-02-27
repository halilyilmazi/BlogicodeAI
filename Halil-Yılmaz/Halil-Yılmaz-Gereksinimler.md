# Halil Yılmaz - Görev ve Gereksinim Analizi

Bu doküman, BlogicodeAI projesindeki temel sistem gereksinimlerini listelemektedir. Proje bireysel yürütüldüğü için tüm frontend ve backend modülleri bu kapsamda geliştirilecektir.

1. **Kayıt Olma**
   - **API Metodu:** `POST /api/auth/register`
   - **Açıklama:** Kullanıcı sisteme ad-soyad, email ve şifre ile kayıt olur. (Not: Email benzersiz olmalıdır.)

2.  **Giriş Yapma**
   - **API Metodu:** `POST /api/auth/login`
   - **Açıklama:** Kullanıcı email ve şifre ile sisteme giriş yapar. (Not: Hatalı girişlerde hata mesajı döner.)

3. **Profil Görüntüleme**
   - **API Metodu:** `GET /api/users/{id}`
   - **Açıklama:** Kullanıcının profil bilgileri ve yazdığı bloglar listelenir.

4. **Profil Güncelleme**
   - **API Metodu:** `UPDATE /api/users/{id}`
   - **Açıklama:** Kullanıcı profil fotoğrafı, biyografi ve kullanıcı adını güncelleyebilir.

5. **Hesap Silme**
   - **API Metodu:** `DELETE /api/users/{id}`
   - **Açıklama:** Kullanıcının hesabını sistemden kalıcı olarak silmesini sağlar. Kullanıcı hesabını kapatmak istediğinde veya yönetici tarafından hesap kapatılması gerektiğinde kullanılır. Bu işlem geri alınamaz ve kullanıcının tüm verileri silinir. Güvenlik için giriş yapmış olmak gerekir.

6. **Blog Yazısı Oluşturma**
   - **API Metodu:** `POST /api/posts`
   - **Açıklama:**   Kullanıcı başlık, içerik, kategori ve etiketler ile blog yazısı oluşturur. (Not: Sadece giriş yapmış kullanıcılar yazı oluşturabilir.)

7. **Blog Yazılarını Listeleme**
   - **API Metodu:** `GET /api/posts`
   - **Açıklama:** Tüm blog yazıları tarih/popülerlik sırasına göre listelenir. (Not: Kategoriye veya etikete göre filtreleme yapılabilir.)

8. **Blog Yazısı Silme**
   - **API Metodu:** `DELETE /api/posts/{id}`
   - **Açıklama:** Yazının sahibi yazısını silebilir. (Özgür bir platform olduğu için topluluk kurallarına aykırı olmadıkça admin kullanıcı yazılarını silemez.)

9. **Yorum Ekleme**
   - **API Metodu:** `POST /api/posts/{id}/comments`
   - **Açıklama:** Kullanıcılar görüntüledikleri blog yazısına yorum ekleyebilir.

10. **Yorum Silme**
   - **API Metodu:** `DELETE /api/comments/{id}`
   - **Açıklama:** Kullanıcı kendi yorumunu silebilir.

11.  **AI Asistanı(ChatBot Modülü)**
   - **API Metodu:** `POST /api/chatbot`
   - **Açıklama:** Kullanıcı trend konular hakkında chatbot ile mesajlaşabilir. Mesaj kaydı tutulmaz. Chat geçmişi kullanıcıya özeldir.