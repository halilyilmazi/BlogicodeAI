const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- SAHTE VERİTABANLARIMIZ (Uygulama çalıştıkça hafızada tutulur) ---
let users = [];
let posts = [];
let comments = [];

// 1. Kayıt Olma (Register)
app.post('/api/auth/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(409).json({ code: "CONFLICT", message: "Bu email adresi zaten kullanımda." });
    }

    const newUser = { 
        id: Date.now().toString(), 
        firstName, 
        lastName, 
        email, 
        password,
        username: "",
        bio: "",
        profilePhoto: ""
    };
    users.push(newUser);
    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu", user: newUser });
});

// 2. Giriş Yapma (Login)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.status(200).json({ message: "Giriş başarılı", token: "blogicodeai-jwt-token-777", user });
    } else {
        res.status(401).json({ code: "UNAUTHORIZED", message: "Hatalı email veya şifre." });
    }
});

// 3. Profil Görüntüleme
app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    // Kullanıcının yazdığı blogları da bulup profile ekliyoruz
    const userPosts = posts.filter(p => p.authorId === req.params.id);
    res.status(200).json({ user, posts: userPosts });
});

// 4. Profil Güncelleme
app.put('/api/users/:id', (req, res) => {
    const { username, bio, profilePhoto } = req.body;
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    
    // Sadece gönderilen bilgileri güncelliyoruz
    users[userIndex] = { ...users[userIndex], username, bio, profilePhoto };
    res.status(200).json({ message: "Profil başarıyla güncellendi", user: users[userIndex] });
});

// 5. Hesap Silme
app.delete('/api/users/:id', (req, res) => {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    
    users.splice(userIndex, 1);
    res.status(204).send(); // 204 No Content (Başarıyla silindi, içerik yok)
});

// 6. Blog Yazısı Oluşturma
app.post('/api/posts', (req, res) => {
    const { title, content, category, authorId } = req.body;
    const newPost = { 
        id: Date.now().toString(), 
        authorId,
        title, 
        content, 
        category, 
        tags: [],
        createdAt: new Date().toISOString() 
    };
    posts.push(newPost);
    res.status(201).json({ message: "Yazı başarıyla oluşturuldu", post: newPost });
});

// 7. Blog Yazılarını Listeleme
app.get('/api/posts', (req, res) => {
    res.status(200).json({ data: posts });
});

// 8. Blog Yazısı Silme
app.delete('/api/posts/:id', (req, res) => {
    const postIndex = posts.findIndex(p => p.id === req.params.id);
    if (postIndex === -1) {
        return res.status(404).json({ message: "Yazı bulunamadı." });
    }
    
    posts.splice(postIndex, 1);
    res.status(204).send();
});

// 9. Yorum Ekleme
app.post('/api/posts/:id/comments', (req, res) => {
    const { content, authorId } = req.body;
    const newComment = { 
        id: Date.now().toString(), 
        postId: req.params.id, 
        authorId, 
        content, 
        createdAt: new Date().toISOString() 
    };
    comments.push(newComment);
    res.status(201).json({ message: "Yorum başarıyla eklendi", comment: newComment });
});

// 10. Yorum Silme
app.delete('/api/comments/:id', (req, res) => {
    const commentIndex = comments.findIndex(c => c.id === req.params.id);
    if (commentIndex === -1) {
        return res.status(404).json({ message: "Yorum bulunamadı." });
    }
    
    comments.splice(commentIndex, 1);
    res.status(204).send();
});

// 11. AI Asistanı (ChatBot)
app.post('/api/chatbot', (req, res) => {
    const { message } = req.body;
    res.status(200).json({ 
        reply: `Yapay Zeka: "${message}" konulu mesajınızı aldım. Size nasıl yardımcı olabilirim?` 
    });
});

// Ana Sayfa Kontrolü
app.get('/', (req, res) => {
    res.json({ mesaj: "BlogicodeAI API'si tüm 11 gereksinimiyle tıkır tıkır çalışıyor!" });
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde aktif! Tüm rotalar devrede.`);
});