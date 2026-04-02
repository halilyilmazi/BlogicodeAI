const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// --- JWT MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Erişim reddedildi' });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Geçersiz token' });
    }
};

// --- MONGODB BAĞLANTISI ---
const mongoURI = process.env.MONGO_URI;

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
    profilePhoto: { type: String, default: "" }
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
        if (!firstName || !lastName || !email || !password) return res.status(400).json({ message: "Tüm alanlar zorunludur." });
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(409).json({ message: "Bu email adresi zaten kullanımda." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ firstName, lastName, email, password: hashedPassword });
        res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu", user: { ...newUser.toObject(), password: undefined } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Giriş Yapma (Login)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email ve şifre zorunludur." });
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Hatalı email veya şifre." });
        }
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Giriş başarılı", token, user: { ...user.toObject(), password: undefined } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Profil Görüntüleme
app.get('/api/users/:id', authenticateToken, async (req, res) => {
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
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) return res.status(403).json({ message: "Bu profili güncelleyemezsiniz." });
        const { username, bio, profilePhoto } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { username, bio, profilePhoto }, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        res.status(200).json({ message: "Profil başarıyla güncellendi", user: { ...updatedUser.toObject(), password: undefined } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Hesap Silme
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) return res.status(403).json({ message: "Bu hesabı silemezsiniz." });
        await Post.deleteMany({ authorId: req.params.id });
        await Comment.deleteMany({ authorId: req.params.id });
        await User.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Blog Yazısı Oluşturma
app.post('/api/posts', authenticateToken, async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        if (!title || !content) return res.status(400).json({ message: "Başlık ve içerik zorunludur." });
        const newPost = await Post.create({ title, content, category, authorId: req.user.id, tags });
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
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Yazı bulunamadı." });
        if (post.authorId !== req.user.id) return res.status(403).json({ message: "Bu yazıyı silemezsiniz." });
        await Comment.deleteMany({ postId: req.params.id });
        await Post.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Yorum Ekleme
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: "Yorum içeriği zorunludur." });
        const newComment = await Comment.create({ postId: req.params.id, authorId: req.user.id, content });
        res.status(201).json({ message: "Yorum başarıyla eklendi", comment: newComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 10. Yorum Silme
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: "Yorum bulunamadı." });
        if (comment.authorId !== req.user.id) return res.status(403).json({ message: "Bu yorumu silemezsiniz." });
        await Comment.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 11. AI Asistanı (Chatbot Modülü)
app.post('/api/chatbot', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "Mesaj boş olamaz." });
        
        const apiKey = process.env.GOOGLE_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error("Detaylı Yapay Zeka Hatası:", error.message);
        res.status(500).json({ reply: "Asistan şu an uyanamadı, lütfen 5 saniye sonra tekrar deneyin." });
    }
});

// Ana Sayfa Kontrolü
app.get('/', (req, res) => {
    res.json({ mesaj: "BlogicodeAI API'si MongoDB destekli olarak tıkır tıkır çalışıyor!" });
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde aktif!`);
});