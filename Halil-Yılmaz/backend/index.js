const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB BAĞLANTISI ---
// Yapay zekanın bozduğu o bağlantıyı tekrar senin orijinal linkinle değiştirdik.
const mongoURI = "mongodb+srv://ylmzyzlm:tqAR4Qxj@cluster0.yzs8d09.mongodb.net/blogicode?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("Harika! MongoDB Atlas'a başarıyla bağlanıldı."))
    .catch((err) => console.log("Veritabanı bağlantı hatası:", err));

// --- VERİTABANI ŞEMALARI (Modeller) ---
const User = mongoose.model('User', new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, default: "" },
    bio: { type: String, default: "" },
    profession: { type: String, default: "" }, // Meslek
    gender: { type: String, default: "" },     // Cinsiyet
    birthDate: { type: String, default: "" },  // Doğum Tarihi
    profilePhoto: { type: String, default: "" } // Profil Fotoğrafı URL
}, { timestamps: true }));

const Post = mongoose.model('Post', new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String },
    authorId: { type: String, required: true },
    tags: [String]
}, { timestamps: true }));

const Comment = mongoose.model('Comment', new mongoose.Schema({
    postId: { type: String, required: true },
    authorId: { type: String, required: true },
    content: { type: String, required: true }
}, { timestamps: true }));


// --- 11 GEREKSİNİM İÇİN API ROTALARI ---

// 1. Kayıt Olma (Register)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(409).json({ message: "Bu email adresi zaten kullanımda." });

        const newUser = await User.create({ firstName, lastName, email, password });
        res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu", user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Giriş Yapma (Login)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (user) {
            // Frontend'in çökmaması için basit bir sahte token dönüyoruz
            res.status(200).json({ message: "Giriş başarılı", token: "blogicodeai-jwt-token-777", user });
        } else {
            res.status(401).json({ message: "Hatalı email veya şifre." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Profil Görüntüleme (Token zorunluluğu kaldırıldı)
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        const userPosts = await Post.find({ authorId: req.params.id });
        res.status(200).json({ user, posts: userPosts });
    } catch (error) {
        res.status(500).json({ error: "Geçersiz ID formatı" });
    }
});

// 4. Profil Güncelleme
app.put('/api/users/:id', async (req, res) => {
    try {
        const { username, bio, profilePhoto } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { username, bio, profilePhoto }, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        res.status(200).json({ message: "Profil başarıyla güncellendi", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Hesap Silme
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Blog Yazısı Oluşturma
app.post('/api/posts', async (req, res) => {
    try {
        const newPost = await Post.create(req.body);
        res.status(201).json({ message: "Yazı başarıyla oluşturuldu", post: newPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Blog Yazılarını Listeleme
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json({ data: posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Blog Yazısı Silme
app.delete('/api/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Yorum Ekleme
app.post('/api/posts/:id/comments', async (req, res) => {
    try {
        const { content, authorId } = req.body;
        const newComment = await Comment.create({ postId: req.params.id, authorId, content });
        res.status(201).json({ message: "Yorum başarıyla eklendi", comment: newComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 10. Yorum Silme
app.delete('/api/comments/:id', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 11. AI Asistanı (Gerçek Gemini Bağlantısı)
app.post('/api/chatbot', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Yapay zeka anahtarını env dosyasından kurtarıp doğrudan buraya yazdık
        const apiKey = "AIzaSyBB3ZMooxsAx-I1DfOwo57A2QbyYDLbIWk".trim(); 
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error("Yapay zeka hatası:", error.message);
        res.status(500).json({ reply: "Hata: Asistan şu an meşgul, lütfen tekrar deneyin." });
    }
});

// Ana Sayfa Kontrolü
app.get('/', (req, res) => {
    res.json({ mesaj: "BlogicodeAI API'si MongoDB ve Gemini destekli olarak tıkır tıkır çalışıyor!" });
});
// YÖNETİCİ İÇİN: Tüm Kullanıcıları Getir
app.get('/api/users', async (req, res) => {
    try {
        // Güvenlik için şifreleri '-password' diyerek gizliyoruz
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Kullanıcılar getirilirken hata oluştu." });
    }
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde aktif!`);
});