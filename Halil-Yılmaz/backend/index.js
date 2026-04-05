require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI, DynamicRetrievalMode } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const frontendDir = path.resolve(__dirname, '..', 'frontend');
const indexHtmlPath = path.join(frontendDir, 'index.html');

// --- MONGODB: Vercel'de Environment Variable MONGODB_URI; yerelde backend/.env
// NOT: process.exit(1) kullanma — Vercel'de URI yoksa tüm route'lar yüklenmeden süreç ölür, /api/health bile çalışmaz.
const mongoURI = process.env.MONGODB_URI;
if (mongoURI) {
    mongoose.connect(mongoURI)
        .then(() => console.log("Harika! MongoDB Atlas'a başarıyla bağlanıldı."))
        .catch((err) => console.log("Veritabanı bağlantı hatası:", err));
} else {
    console.error('MONGODB_URI tanımlı değil. Vercel → Settings → Environment Variables → MONGODB_URI ekleyin; yerelde backend/.env kullanın.');
    if (require.main === module && !process.env.VERCEL) {
        console.error('Yerel çalıştırma için çıkılıyor (node index.js).');
        process.exit(1);
    }
}

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

/** API yanıtlarında şifre dönülmez */
function userToPublic(userDoc) {
    if (!userDoc) return null;
    const o = typeof userDoc.toObject === 'function' ? userDoc.toObject() : { ...userDoc };
    delete o.password;
    return o;
}

// --- 11 GEREKSİNİM İÇİN API ROTALARI ---

// 1. Kayıt Olma (Register)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const fn = firstName != null ? String(firstName).trim() : '';
        const ln = lastName != null ? String(lastName).trim() : '';
        const em = email != null ? String(email).trim() : '';
        const pw = password != null ? String(password) : '';

        if (!fn || !ln) {
            return res.status(400).json({ message: 'Ad ve soyad zorunludur.' });
        }
        if (!em || !pw.trim()) {
            return res.status(400).json({ message: 'E-posta ve şifre zorunludur.' });
        }

        const userExists = await User.findOne({ email: em });
        if (userExists) return res.status(409).json({ message: "Bu email adresi zaten kullanımda." });

        const newUser = await User.create({ firstName: fn, lastName: ln, email: em, password: pw });
        res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu", user: userToPublic(newUser) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Giriş Yapma (Login)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const em = email != null ? String(email).trim() : '';
        const pw = password != null ? String(password) : '';
        if (!em || !pw) {
            return res.status(400).json({ message: 'E-posta ve şifre gerekli.' });
        }
        const user = await User.findOne({ email: em, password: pw });
        if (user) {
            res.status(200).json({
                message: "Giriş başarılı",
                token: "blogicodeai-jwt-token-777",
                user: userToPublic(user)
            });
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
        res.status(200).json({ user: userToPublic(user), posts: userPosts });
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
        res.status(200).json({ message: "Profil başarıyla güncellendi", user: userToPublic(updatedUser) });
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
        const { title, content, authorId, category, tags } = req.body;
        if (!title || !String(title).trim() || !content || !String(content).trim()) {
            return res.status(400).json({ message: 'Başlık ve içerik zorunludur.' });
        }
        if (!authorId || !String(authorId).trim()) {
            return res.status(400).json({ message: 'Yazar bilgisi (authorId) gerekli.' });
        }
        const newPost = await Post.create({
            title: String(title).trim(),
            content: String(content).trim(),
            authorId: String(authorId).trim(),
            category: category != null ? String(category).trim() : '',
            tags: Array.isArray(tags) ? tags : []
        });
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
        if (!content || !String(content).trim()) {
            return res.status(400).json({ message: 'Yorum metni boş olamaz.' });
        }
        if (!authorId || !String(authorId).trim()) {
            return res.status(400).json({ message: 'Yorum için kullanıcı kimliği gerekli.' });
        }
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Yazı bulunamadı.' });
        const newComment = await Comment.create({
            postId: String(req.params.id),
            authorId: String(authorId).trim(),
            content: String(content).trim()
        });
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

const CHAT_SYSTEM_INSTRUCTION = `Sen BlogicodeAI platformunun resmi yapay zeka asistanısın. Türkçe, net ve samimi konuş.
Odak: teknoloji, yazılım, yapay zeka, siber güvenlik, bulut, veri bilimi, kariyer ve güncel dijital gündem.
Kullanıcı güncel haberler veya trend konular sorarsa: kısa madde işaretleriyle özet ver; mümkünse arama kaynaklarından gelen bilgiyi kullan.
Kesin tarih/sayı iddiası gerektiren konularda, bilginin anlık doğrulanamayabileceğini tek cümleyle belirt.
Kod istenirse çalışır örnek ver; güvenlik veya hukuk tavsiyesi yerine genel bilgilendirme yap, kritik konularda uzmana yönlendir.
Yanıtları gereksiz uzatma; okunaklı paragraflar veya kısa listeler kullan.`;

function normalizeChatHistory(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    for (const item of raw.slice(-24)) {
        if (!item || typeof item.text !== 'string') continue;
        const t = item.text.trim();
        if (!t) continue;
        const role = item.role === 'model' ? 'model' : 'user';
        out.push({ role, parts: [{ text: t.slice(0, 12000) }] });
    }
    return out;
}

function appendGroundingSources(text, response) {
    try {
        const cand = response?.candidates?.[0];
        const chunks = cand?.groundingMetadata?.groundingChunks;
        if (!Array.isArray(chunks) || !chunks.length) return text;
        const lines = [];
        const seen = new Set();
        for (const ch of chunks) {
            const uri = ch?.web?.uri;
            const title = ch?.web?.title;
            if (!uri || seen.has(uri)) continue;
            seen.add(uri);
            lines.push(title ? `• ${title}: ${uri}` : `• ${uri}`);
            if (lines.length >= 6) break;
        }
        if (lines.length) return `${text}\n\n— Kaynaklar —\n${lines.join('\n')}`;
    } catch (_) { /* ignore */ }
    return text;
}

/** Gemini yok / hata verince bile sohbet akışı kırılmasın: her zaman anlamlı Türkçe yanıt. */
function localAssistantReply(userText, history) {
    const lower = userText.toLowerCase().trim();
    const lastModel = [...(history || [])].reverse().find((h) => h && h.role === 'model' && typeof h.text === 'string');
    const lastModelText = lastModel ? lastModel.text.slice(0, 400) : '';

    if (/^(evet|tamam|olur|peki|evt|eyv)$/i.test(userText.trim())) {
        return 'Tamam. Önceki konuda devam edelim mi, yoksa yeni bir soru mu sormak istersin?\n\nÖrnek: "REST API nedir?" veya "MongoDB indeks ne işe yarar?"';
    }
    if (/^(hayır|hayir|yok|olmaz|maalesef)$/i.test(userText.trim())) {
        return 'Anladım. Başka bir konuda yardımcı olayım. Ne merak ediyorsun?';
    }

    if (/merhaba|selam|hey|sa\b|günaydın|iyi günler|iyi akşamlar/i.test(userText)) {
        return 'Merhaba! BlogicodeAI asistanıyım. Teknoloji, yazılım, yapay zeka veya platformdaki yazılar hakkında konuşabiliriz.\n\nİpucu: Sunucuda GEMINI_API_KEY tanımlıysa yanıtlar Google Gemini ile zenginleşir; tanımlı değilse şu an yerel (akıllı yedek) moddasın — yine de sohbet edebilirsin.';
    }

    if (/teşekkür|sağol|saol|eyvallah|thanks/i.test(userText)) {
        return 'Rica ederim. Başka bir sorunda yazman yeterli.';
    }

    if (/trend|haber|gündem|guncel|güncel|bugün ne|son dakika/i.test(lower)) {
        return 'Güncel haber başlıkları için canlı veri kaynağına bağlı değilim (yerel mod). Şunları önerebilirim:\n• BBC News Technology, The Verge, TechCrunch\n• Türkçe: Webtekno, ShiftDelete.Net, Donanım Haber\n\nGenel teknoloji gündeminde sık geçen temalar: büyük dil modelleri ve düzenlemeler, bulut maliyetleri, siber güvenlik olayları, mobil ve açık kaynak ekosistem. Belirli bir ürün veya şirket adı yazarsan o çerçevede bilgi veririm.\n\nTam güncel özet için sunucuya GEMINI_API_KEY + isteğe bağlı GEMINI_ENABLE_SEARCH=true ekleyebilirsin.';
    }

    if (/nasıl başlarım|nereden başlayım|öğren|kurs|roadmap/i.test(lower)) {
        return 'Yazılıma başlangıç için pratik bir yol:\n1) Bir dil seç: genelde Python (veri/otomasyon) veya JavaScript (web).\n2) Temel: değişkenler, döngüler, fonksiyonlar, hata ayıklama.\n3) Küçük proje: hesap makinesi, yapılacaklar listesi API’si, basit blog.\n4) Git + GitHub kullanmayı erken öğren.\n\nHangi alan (web, mobil, veri) ilgini çekiyor? Ona göre daraltalım.';
    }

    if (/python|javascript|typescript|react|node|java\b|go\b|rust|c\+\+|mongodb|sql|api|rest|docker|kubernetes/i.test(lower)) {
        const topic = lower.includes('python') ? 'Python'
            : lower.includes('typescript') || /\bts\b/.test(lower) ? 'TypeScript'
                : /javascript|react|node/.test(lower) ? 'JavaScript / Node / React'
                    : lower.includes('mongodb') ? 'MongoDB'
                        : lower.includes('docker') || lower.includes('kubernetes') ? 'Konteyner / DevOps'
                            : 'Bu teknoloji';
        return `${topic} tarafında yardımcı olabilirim. Sorunu veya hedefini biraz aç: öğrenmek mi istiyorsun, hata mı alıyorsun, mimari mi kuruyorsun?\n\nKısa not: Yerel modda genel rehberlik veriyorum; çok uzun kod üretimi için GEMINI_API_KEY ile Gemini açmak en iyisi.`;
    }

    if (/kim|sen kimsin|ne işe yar|blogicode/i.test(lower)) {
        return 'Ben BlogicodeAI sohbet asistanıyım: teknoloji ve kodlama konularında yönlendirme ve özetle yardımcı olurum. Platformda yazı keşfi, panel ve yorumlar site üzerinden.\n\nŞu an ' + (lastModelText ? 'konuşmaya devam edebiliriz.' : 'yeni bir konu açabilirsin.');
    }

    const snippet = userText.length > 220 ? `${userText.slice(0, 220)}…` : userText;
    return `Şunu yazdın: "${snippet}"\n\nBunu şöyle ilerletebiliriz:\n• Daha net bir hedef yaz (ör. "Express'te CORS hatası", "SQL JOIN örneği").\n• İstersen bir önceki cevabıma tepki ver: neyi derinleştirelim?\n• Keşfet sayfasında ilgili yazılara da göz atabilirsin.\n\nTam yapay zeka cevabı için backend .env içine Google AI Studio anahtarını GEMINI_API_KEY olarak ekle; yine de anahtar olmadan bu sohbet ekranı çalışmaya devam eder.`;
}

const DEFAULT_GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-8b'];

function parseModelList() {
    const raw = (process.env.GEMINI_MODEL || '').trim();
    if (raw) {
        return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [...DEFAULT_GEMINI_MODELS];
}

async function geminiTryModel(genAI, modelName, userText, geminiHistory, useSearch) {
    const searchTools = useSearch
        ? [{
            googleSearchRetrieval: {
                dynamicRetrievalConfig: {
                    mode: DynamicRetrievalMode.MODE_DYNAMIC,
                    dynamicThreshold: 0.25
                }
            }
        }]
        : [];

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        tools: searchTools.length ? searchTools : undefined
    });
    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(userText);
    const response = result.response;
    let text;
    try {
        text = response.text();
    } catch (e) {
        const pr = response.promptFeedback;
        const reason = pr?.blockReason || e.message || 'blocked';
        throw new Error(String(reason));
    }
    if (!text || !String(text).trim()) {
        throw new Error('Boş yanıt');
    }
    return appendGroundingSources(String(text).trim(), response);
}

async function geminiGenerateReply(apiKey, userText, history) {
    const geminiHistory = normalizeChatHistory(history);
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = parseModelList();
    const enableSearch = String(process.env.GEMINI_ENABLE_SEARCH || '').toLowerCase() === 'true';

    for (const modelName of models) {
        try {
            return await geminiTryModel(genAI, modelName, userText, geminiHistory, false);
        } catch (e) {
            console.warn(`[chatbot] Gemini model=${modelName} (arama kapalı):`, e.message);
        }
    }

    if (enableSearch) {
        for (const modelName of models) {
            try {
                return await geminiTryModel(genAI, modelName, userText, geminiHistory, true);
            } catch (e) {
                console.warn(`[chatbot] Gemini model=${modelName} (arama açık):`, e.message);
            }
        }
    }

    return null;
}

// 11. AI Asistanı — önce Gemini (anahtar varsa), olmazsa her zaman yerel yanıt (HTTP 200)
app.post('/api/chatbot', async (req, res) => {
    const { message, history } = req.body || {};
    const userText = typeof message === 'string' ? message.trim() : '';
    if (!userText) {
        return res.status(400).json({ error: 'Mesaj gerekli', reply: 'Lütfen bir mesaj yazın.' });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (apiKey) {
        try {
            const reply = await geminiGenerateReply(apiKey, userText, history);
            if (reply) {
                return res.status(200).json({ reply, source: 'gemini' });
            }
        } catch (error) {
            console.error('[chatbot] Gemini beklenmeyen hata:', error.message);
        }
    } else {
        console.warn('[chatbot] GEMINI_API_KEY boş — yerel asistan kullanılıyor.');
    }

    const fallback = localAssistantReply(userText, history);
    return res.status(200).json({
        reply: fallback,
        source: 'fallback',
        hint: apiKey ? 'Gemini yanıt veremedi; yerel mod kullanıldı.' : 'GEMINI_API_KEY tanımlı değil; yerel mod.'
    });
});

// API durumu (statik site / kök index.html ile çakışmaması için ayrı yol)
app.get('/api/health', (req, res) => {
    const dbOk = Boolean(mongoURI) && mongoose.connection.readyState === 1;
    res.json({
        ok: true,
        mesaj: 'BlogicodeAI API çalışıyor.',
        db: dbOk,
        mongoConfigured: Boolean(mongoURI)
    });
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

// Statik site (config.js, robot-celik.svg vb.) + kök sayfa
if (fs.existsSync(indexHtmlPath)) {
    app.get('/', (req, res) => {
        try {
            const html = fs.readFileSync(indexHtmlPath, 'utf8');
            res.type('html').send(html);
        } catch (e) {
            console.error('index.html okunamadı:', e.message);
            res.status(500).type('text').send('index.html okunamadı: ' + e.message);
        }
    });
    app.use(express.static(frontendDir, { index: false }));
} else {
    console.error('frontend/index.html bulunamadı:', indexHtmlPath);
    app.get('/', (req, res) => {
        res.status(404).type('text').send(
            'index.html bulunamadı.\nBeklenen yol: ' + indexHtmlPath + '\nSunucuyu Halil-Yılmaz\\backend klasöründen çalıştırdığından emin ol.'
        );
    });
}

module.exports = app;

const PORT = Number(process.env.PORT) || 3000;
if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`Sunucu port ${PORT} üzerinde dinliyor.`);
        console.log(`[Blogicode] index.html: ${indexHtmlPath}`);
        console.log(`[Blogicode] dosya var mı: ${fs.existsSync(indexHtmlPath)}`);
        console.log(`Tarayıcıda aç: http://127.0.0.1:${PORT}/ (mümkünse önce bunu dene)`);
        console.log('https:// kullanma. Port 3000\'de başka bir program varsa kapat veya PORT=3001 node index.js kullan.');
    });
    server.on('error', (err) => {
        console.error('Sunucu başlamadı (port meşgul olabilir):', err.message);
    });
}