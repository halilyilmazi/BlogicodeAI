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
    tags: [String],
    likeCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    favoritedBy: { type: [String], default: [] }
}, { timestamps: true }));

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const TOPIC_KEYWORDS = {
    'yapay-zeka': ['yapay zeka', 'machine learning', 'derin öğrenme', 'deep learning', 'chatgpt', 'llm', 'nlp', 'tensorflow', 'pytorch'],
    'yazilim': ['yazılım', 'yazilim', 'programlama', 'developer', 'kod', 'coding', 'javascript', 'python', 'java', 'frontend', 'backend'],
    'bulut': ['bulut', 'cloud', 'aws', 'azure', 'gcp', 'saas', 'serverless'],
    'siber-guvenlik': ['siber', 'güvenlik', 'security', 'pentest', 'malware', 'şifreleme', 'encryption', 'zero trust'],
    'veri-bilimi': ['veri bilimi', 'data science', 'analitik', 'big data', 'etl', 'pandas', 'numpy'],
    'blockchain': ['blockchain', 'kripto', 'bitcoin', 'ethereum', 'web3', 'nft', 'defi'],
    'mobil': ['mobil', 'android', 'ios', 'swift', 'kotlin', 'flutter', 'react native'],
    'devops': ['devops', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'jenkins', 'gitops', 'terraform'],
    'ag-teknolojileri': ['ağ', 'network', 'tcp', 'routing', 'switch', 'vlan', 'cisco'],
    'veritabani': ['veritabanı', 'veritabani', 'database', 'sql', 'mongodb', 'postgresql', 'redis', 'nosql'],
    'robotik': ['robotik', 'robot', 'ros', 'cobot', 'endüstriyel robot', 'iot', 'arduino', 'servo', 'otomasyon']
};

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

// Kullanıcının yorumları (yazı başlığı ile)
app.get('/api/users/:id/comments', async (req, res) => {
    try {
        const uid = req.params.id;
        const comments = await Comment.find({ authorId: uid }).sort({ createdAt: -1 });
        const data = await Promise.all(comments.map(async (c) => {
            let postTitle = '(silinmiş yazı)';
            try {
                const post = await Post.findById(c.postId).select('title');
                if (post && post.title) postTitle = post.title;
            } catch (e) { /* ignore */ }
            return {
                _id: c._id,
                postId: c.postId,
                postTitle,
                content: c.content,
                createdAt: c.createdAt
            };
        }));
        res.status(200).json({ data });
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
        const {
            username, bio, profilePhoto, firstName, lastName,
            profession, gender, birthDate
        } = req.body;
        const patch = {};
        if (username !== undefined) patch.username = username;
        if (bio !== undefined) patch.bio = bio;
        if (profilePhoto !== undefined) patch.profilePhoto = profilePhoto;
        if (firstName !== undefined) patch.firstName = firstName;
        if (lastName !== undefined) patch.lastName = lastName;
        if (profession !== undefined) patch.profession = profession;
        if (gender !== undefined) patch.gender = gender;
        if (birthDate !== undefined) patch.birthDate = birthDate;

        const updatedUser = await User.findByIdAndUpdate(req.params.id, patch, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        res.status(200).json({ message: "Profil başarıyla güncellendi", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Hesap Silme (yazılar, ilgili yorumlar ve kullanıcının yorumları)
app.delete('/api/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const posts = await Post.find({ authorId: id });
        const postIds = posts.map((p) => String(p._id));
        await Comment.deleteMany({ $or: [{ authorId: id }, { postId: { $in: postIds } }] });
        await Post.deleteMany({ authorId: id });
        await User.findByIdAndDelete(id);
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

function buildTopicMatch(topic) {
    const keywords = TOPIC_KEYWORDS[topic];
    if (!keywords || !keywords.length) return null;
    const or = [];
    for (const kw of keywords) {
        const rx = new RegExp(escapeRegex(kw), 'i');
        or.push({ category: rx }, { title: rx }, { content: rx }, { tags: rx });
    }
    return { $or: or };
}

// 7. Blog Yazılarını Listeleme (topic, sort=recent|popular|oldest, q=arama)
app.get('/api/posts', async (req, res) => {
    try {
        const sortParam = (req.query.sort || 'recent').toLowerCase();
        const topic = req.query.topic ? String(req.query.topic).trim() : '';
        const q = req.query.q ? String(req.query.q).trim() : '';

        if (topic && !TOPIC_KEYWORDS[topic]) {
            return res.status(200).json({ data: [] });
        }

        const topicMatch = topic ? buildTopicMatch(topic) : null;
        let searchMatch = null;
        if (q) {
            const rx = new RegExp(escapeRegex(q), 'i');
            searchMatch = {
                $or: [
                    { title: rx },
                    { content: rx },
                    { category: rx },
                    { tags: rx }
                ]
            };
        }

        const andParts = [];
        if (topicMatch) andParts.push(topicMatch);
        if (searchMatch) andParts.push(searchMatch);
        const matchStage = andParts.length ? { $and: andParts } : {};

        let sortObj;
        if (sortParam === 'popular') {
            sortObj = { popularity: -1, createdAt: -1 };
        } else if (sortParam === 'oldest') {
            sortObj = { createdAt: 1 };
        } else {
            sortObj = { createdAt: -1 };
        }

        const pipeline = [
            ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
            {
                $lookup: {
                    from: 'comments',
                    let: { pid: { $toString: '$_id' } },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$postId', '$$pid'] } } }
                    ],
                    as: 'commentDocs'
                }
            },
            {
                $addFields: {
                    commentCount: { $size: '$commentDocs' },
                    likeCount: { $ifNull: ['$likeCount', 0] },
                    favoriteCount: { $ifNull: ['$favoriteCount', 0] },
                    popularity: {
                        $add: [
                            { $ifNull: ['$likeCount', 0] },
                            { $ifNull: ['$favoriteCount', 0] },
                            { $size: '$commentDocs' }
                        ]
                    }
                }
            },
            { $sort: sortObj },
            { $project: { commentDocs: 0 } }
        ];

        const posts = await Post.aggregate(pipeline);
        res.status(200).json({ data: posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/:id/favorites', async (req, res) => {
    try {
        const uid = req.params.id;
        const pipeline = [
            { $match: { favoritedBy: uid } },
            {
                $lookup: {
                    from: 'comments',
                    let: { pid: { $toString: '$_id' } },
                    pipeline: [{ $match: { $expr: { $eq: ['$postId', '$$pid'] } } }],
                    as: 'commentDocs'
                }
            },
            {
                $addFields: {
                    commentCount: { $size: '$commentDocs' },
                    likeCount: { $ifNull: ['$likeCount', 0] },
                    favoriteCount: { $ifNull: ['$favoriteCount', 0] }
                }
            },
            { $sort: { createdAt: -1 } },
            { $project: { commentDocs: 0 } }
        ];
        const posts = await Post.aggregate(pipeline);
        res.status(200).json({ data: posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/posts/:id', async (req, res) => {
    try {
        const { title, content, category, authorId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Yazı bulunamadı.' });
        if (!authorId || post.authorId !== authorId) {
            return res.status(403).json({ message: 'Bu yazıyı düzenleme yetkiniz yok.' });
        }
        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        if (category !== undefined) post.category = category;
        await post.save();
        res.status(200).json({ message: 'Güncellendi', post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/posts/:id/react', async (req, res) => {
    try {
        const { userId, action } = req.body;
        if (!userId || !['like', 'favorite'].includes(action)) {
            return res.status(400).json({ message: 'userId ve action (like|favorite) gerekli.' });
        }
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Yazı bulunamadı.' });

        const listField = action === 'like' ? 'likedBy' : 'favoritedBy';
        const countField = action === 'like' ? 'likeCount' : 'favoriteCount';
        const arr = post[listField] || [];
        if (arr.includes(userId)) {
            return res.status(200).json({ message: 'Zaten işaretli.', post: post.toObject ? post.toObject() : post });
        }
        post[listField] = [...arr, userId];
        post[countField] = (post[countField] || 0) + 1;
        await post.save();
        res.status(200).json({ message: 'Tamam', post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Blog Yazısı Silme (yalnızca yazar)
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const authorId = req.query.authorId;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Yazı bulunamadı.' });
        if (!authorId || post.authorId !== authorId) {
            return res.status(403).json({ message: 'Bu yazıyı silme yetkiniz yok.' });
        }
        await Comment.deleteMany({ postId: req.params.id });
        await Post.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/posts/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: -1 });
        res.status(200).json({ data: comments });
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

// 10. Yorum Silme (yalnızca yorum sahibi)
app.delete('/api/comments/:id', async (req, res) => {
    try {
        const authorId = req.query.authorId;
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Yorum bulunamadı.' });
        if (!authorId || comment.authorId !== authorId) {
            return res.status(403).json({ message: 'Bu yorumu silme yetkiniz yok.' });
        }
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