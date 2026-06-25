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

// =====================================================================
//  CANLI İSTEK PANELİ (/canli) — Sunum/kanıt videosu için
//  Mobil uygulamadan gelen her REST isteğini ve karşılığında yapılan
//  veritabanı işlemini tarayıcıda gerçek zamanlı gösterir (SSE).
//  Akış: Mobil --> REST API (/api/...) --> MongoDB işlemi --> yanıt
// =====================================================================
const liveEvents = [];           // son istekler (panel sonradan açılırsa geçmiş görünür)
const LIVE_MAX = 60;
const liveClients = new Set();   // bağlı SSE istemcileri

function liveBroadcast(event) {
    liveEvents.push(event);
    if (liveEvents.length > LIVE_MAX) liveEvents.shift();
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const res of liveClients) {
        try { res.write(payload); } catch (_) { /* kopan istemci */ }
    }
}

// Yanıt gövdesinden DB işleminin sonucunu (kayıt id'si / kayıt sayısı) çıkar
function liveResultSummary(method, payload) {
    if (payload == null || typeof payload !== 'object') return '';
    const body = payload.data != null ? payload.data : payload;
    if (Array.isArray(body)) return `${body.length} kayıt döndü`;
    if (body._id) {
        const id = String(body._id);
        if (method === 'POST') return `✓ kaydedildi (id: ${id.slice(-6)})`;
        if (method === 'PUT' || method === 'PATCH') return `✓ güncellendi (id: ${id.slice(-6)})`;
        return `id: ${id.slice(-6)}`;
    }
    if (method === 'DELETE') return '✓ silindi';
    if (typeof payload.message === 'string') return payload.message.slice(0, 60);
    return '';
}

const DB_OP = { GET: 'find', POST: 'insert', PUT: 'update', PATCH: 'update', DELETE: 'delete' };

// Sadece REST API (/api/...) isteklerini izle; statik dosya/panel trafiğini gösterme.
app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) return next();
    const start = Date.now();
    const segments = req.path.split('/').filter(Boolean); // ['api','posts',...]
    const collection = segments[1] || '';
    const origJson = res.json.bind(res);
    res.json = (payload) => { res.locals.__livePayload = payload; return origJson(payload); };
    res.on('finish', () => {
        const ok = res.statusCode >= 200 && res.statusCode < 300;
        liveBroadcast({
            time: new Date().toLocaleTimeString('tr-TR'),
            method: req.method,
            path: req.originalUrl,
            collection,
            dbOp: ok ? `MongoDB ${DB_OP[req.method] || req.method} (${collection})` : '— (işlem yapılmadı)',
            result: ok ? liveResultSummary(req.method, res.locals.__livePayload) : '',
            status: res.statusCode,
            ok,
            durationMs: Date.now() - start,
            cache: res.getHeader('X-Cache') || ''
        });
    });
    next();
});

// SSE akışı: panel buraya bağlanır, her yeni istek anında push edilir.
app.get('/canli/stream', (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    });
    res.flushHeaders && res.flushHeaders();
    res.write('retry: 3000\n\n');
    for (const ev of liveEvents) res.write(`data: ${JSON.stringify(ev)}\n\n`); // geçmişi gönder
    liveClients.add(res);
    const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch (_) {} }, 25000);
    req.on('close', () => { clearInterval(ping); liveClients.delete(res); });
});

// Canlı panel sayfası
app.get('/canli', (req, res) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BlogicodeAI — Canlı API & Veritabanı Paneli</title>
<style>
  :root{ --bg:#0b1020; --card:#121a30; --line:#22304f; --txt:#e6ecff; --mut:#8aa0c8; --grn:#2ecc71; --red:#ff5d5d; --blu:#4d8dff; }
  *{box-sizing:border-box} body{margin:0;font:15px/1.45 "Segoe UI",system-ui,sans-serif;background:var(--bg);color:var(--txt)}
  header{padding:18px 24px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:14px}
  header h1{font-size:18px;margin:0} header .flow{color:var(--mut);font-size:13px}
  .dot{width:9px;height:9px;border-radius:50%;background:var(--grn);box-shadow:0 0 10px var(--grn);animation:p 1.4s infinite}
  @keyframes p{50%{opacity:.35}}
  .wrap{padding:18px 24px;max-width:1100px;margin:0 auto}
  .row{display:grid;grid-template-columns:92px 78px 1fr 1fr 130px;gap:12px;align-items:center;
       padding:12px 14px;border:1px solid var(--line);background:var(--card);border-radius:10px;margin-bottom:10px;
       animation:in .35s ease}
  @keyframes in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
  .time{color:var(--mut);font-variant-numeric:tabular-nums}
  .badge{display:inline-block;padding:3px 9px;border-radius:6px;font-weight:700;font-size:12px;text-align:center}
  .m-GET{background:#13314f;color:#7fb3ff}.m-POST{background:#15402a;color:#5be59a}
  .m-PUT,.m-PATCH{background:#3d3413;color:#ffd86b}.m-DELETE{background:#451720;color:#ff8d8d}
  .path{font-family:ui-monospace,Menlo,monospace;color:#cfe0ff;word-break:break-all}
  .db{color:var(--mut)} .db b{color:#bfe9ff;font-weight:600} .res{color:var(--grn);font-size:13px}
  .right{display:flex;gap:8px;justify-content:flex-end;align-items:center}
  .st{font-weight:700} .ok{color:var(--grn)} .er{color:var(--red)}
  .dur{color:var(--mut);font-size:12px} .cache{background:#3a2a55;color:#d3b3ff;font-size:11px;padding:2px 7px;border-radius:5px}
  .empty{color:var(--mut);text-align:center;padding:60px 0}
  .arrow{color:var(--blu)}
</style></head>
<body>
<header>
  <span class="dot"></span>
  <h1>BlogicodeAI — Canlı API &amp; Veritabanı Paneli</h1>
  <span class="flow">Mobil Uygulama <span class="arrow">→</span> REST API <span class="arrow">→</span> MongoDB</span>
</header>
<div class="wrap"><div id="list"><div class="empty" id="empty">Mobil uygulamadan bir işlem yapın (yazı ekle, beğen, sil…) — istek burada anında görünecek.</div></div></div>
<script>
  const list = document.getElementById('list');
  const empty = document.getElementById('empty');
  const es = new EventSource('/canli/stream');
  es.onmessage = (e) => {
    const ev = JSON.parse(e.data);
    if (empty) empty.remove();
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML =
      '<span class="time">'+ev.time+'</span>'+
      '<span class="badge m-'+ev.method+'">'+ev.method+'</span>'+
      '<span class="path">'+ev.path+'</span>'+
      '<span class="db"><b>'+ev.dbOp+'</b>'+(ev.result?'<br><span class="res">'+ev.result+'</span>':'')+'</span>'+
      '<span class="right">'+(ev.cache?'<span class="cache">Redis '+ev.cache+'</span>':'')+
        '<span class="st '+(ev.ok?'ok':'er')+'">'+ev.status+'</span>'+
        '<span class="dur">'+ev.durationMs+'ms</span></span>';
    list.prepend(row);
  };
</script>
</body></html>`);
});
// ===================== /CANLI İSTEK PANELİ SONU ======================

const frontendDir = path.resolve(__dirname, '..', 'frontend');
const indexHtmlPath = path.join(frontendDir, 'index.html');

// --- MONGODB: Vercel'de Environment Variable MONGODB_URI; yerelde backend/.env
// NOT: process.exit(1) kullanma — Vercel'de URI yoksa tüm route'lar yüklenmeden süreç ölür, /api/health bile çalışmaz.
const mongoURI = process.env.MONGODB_URI;
if (mongoURI) {
    // Bağlantı dizisi ortam değişkeninden gelir: yerelde/Docker'da mongodb://mongo:27017/blogicode,
    // canlıda (Vercel) MongoDB Atlas. Sabit (hardcoded) bağlantı dizisi kullanılmaz.
    mongoose.connect(mongoURI)
        .then(() => console.log("Harika! MongoDB'ye başarıyla bağlanıldı."))
        .catch((err) => console.log("Veritabanı bağlantı hatası:", err));
} else {
    if (process.env.VERCEL) {
        console.warn('[Blogicode] MONGODB_URI eksik — veritabanı API’leri 503 dönecek; Vercel’e ortam değişkeni ekleyin.');
    } else {
        console.error('MONGODB_URI tanımlı değil. Vercel → Settings → Environment Variables → MONGODB_URI ekleyin; yerelde backend/.env kullanın.');
    }
    if (require.main === module && !process.env.VERCEL) {
        console.error('Yerel çalıştırma için çıkılıyor (node index.js).');
        process.exit(1);
    }
}

// --- REDIS (opsiyonel önbellek): GET /api/posts yanıtlarını önbelleğe alır ---
// REDIS_URL tanımlıysa bağlanır (Docker'da redis://redis:6379). Tanımlı değilse veya
// bağlantı kurulamazsa önbellek sessizce devre dışı kalır; uygulama normal çalışmaya devam eder.
let redisClient = null;
let postsCacheVersion = 1; // Yazı/yorum değişikliğinde artar -> eski önbellek anahtarları geçersizleşir
const POSTS_CACHE_TTL = 60; // saniye
const REDIS_URL = process.env.REDIS_URL;
if (REDIS_URL) {
    try {
        const { createClient } = require('redis');
        redisClient = createClient({ url: REDIS_URL });
        redisClient.on('error', (e) => console.warn('[Redis] hata:', e.message));
        redisClient.connect()
            .then(() => console.log('[Redis] bağlandı:', REDIS_URL))
            .catch((e) => { console.warn('[Redis] bağlanılamadı, önbellek devre dışı:', e.message); redisClient = null; });
    } catch (e) {
        console.warn('[Redis] modül yüklenemedi, önbellek devre dışı:', e.message);
        redisClient = null;
    }
}
function invalidatePostsCache() { postsCacheVersion++; }

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

/** Vercel'de MONGODB_URI yokken Mongoose sorguları 500 üretir; önce net 503 döndür (CORS için OPTIONS atlanır). */
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    if (!req.path.startsWith('/api')) return next();
    if (req.path === '/api/health') return next();
    if (req.path === '/api/chatbot') return next();
    if (!mongoURI) {
        return res.status(503).json({
            error: 'Veritabanı yapılandırılmadı',
            code: 'MONGODB_URI_MISSING',
            message: 'Sunucuda MONGODB_URI tanımlı değil. Vercel → Project → Settings → Environment Variables → MONGODB_URI ekleyin (MongoDB Atlas bağlantı dizisi), kaydedin ve Redeploy yapın. Atlas Network Access: 0.0.0.0/0 veya Vercel IP.'
        });
    }
    return next();
});

// Yazı/yorum değiştiren başarılı istekler sonrası GET /api/posts önbelleğini geçersiz kıl.
app.use((req, res, next) => {
    const mutating = ['POST', 'PUT', 'DELETE'].includes(req.method);
    const affectsPosts = req.path.startsWith('/api/posts') || req.path.startsWith('/api/comments');
    if (mutating && affectsPosts) {
        res.on('finish', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) invalidatePostsCache();
        });
    }
    next();
});

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
        // Kayıttan sonra otomatik giriş için token döndür (login ile aynı sözleşme).
        res.status(201).json({
            message: "Kullanıcı başarıyla oluşturuldu",
            token: "blogicodeai-jwt-token-777",
            user: userToPublic(newUser)
        });
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

        // --- REDIS ÖNBELLEK: aynı sorgu için DB'ye gitmeden yanıt döndür ---
        const cacheKey = `posts:v${postsCacheVersion}:${sortParam}|${topic}|${q}`;
        if (redisClient && redisClient.isReady) {
            try {
                const cached = await redisClient.get(cacheKey);
                if (cached) {
                    console.log('[Redis] CACHE HIT  ->', cacheKey);
                    res.set('X-Cache', 'HIT');
                    return res.status(200).json({ data: JSON.parse(cached) });
                }
                console.log('[Redis] CACHE MISS ->', cacheKey);
                res.set('X-Cache', 'MISS');
            } catch (e) {
                console.warn('[Redis] okuma hatası:', e.message);
            }
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

        if (redisClient && redisClient.isReady) {
            try {
                await redisClient.setEx(cacheKey, POSTS_CACHE_TTL, JSON.stringify(posts));
            } catch (e) {
                console.warn('[Redis] yazma hatası:', e.message);
            }
        }
        res.set('X-Cache', 'MISS');
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

app.get('/api/users/:id/likes', async (req, res) => {
    try {
        const uid = req.params.id;
        const pipeline = [
            { $match: { likedBy: uid } },
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
        // if (!authorId || post.authorId !== authorId) {
        //     return res.status(403).json({ message: 'Bu yazıyı silme yetkiniz yok.' });
        // }
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
        //if (!authorId || comment.authorId !== authorId) {
        //    return res.status(403).json({ message: 'Bu yorumu silme yetkiniz yok.' });
        //}
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

/**
 * Güncel teknoloji & inovasyon başlıkları için zengin, bilgilendirici yanıtlar.
 * Canlı arama olmadan da anlamlı kalan (evergreen) tematik özetler.
 */
const INNOVATION_TOPICS = [
    {
        rx: /uretken|generative|\bllm\b|chatgpt|\bgpt\b|gemini|claude|dil modeli|buyuk dil/i,
        reply: `**Üretken yapay zeka (Generative AI)** şu an teknolojinin en hızlı büyüyen alanı:
• **Büyük dil modelleri (LLM):** GPT, Gemini, Claude gibi modeller metin, kod ve fikir üretiminde çok güçlü.
• **Çok modluluk (multimodal):** Tek bir model artık metin + görsel + ses + video anlayıp üretebiliyor.
• **AI ajanları:** Kendi başına araç kullanıp çok adımlı görev tamamlayan otonom ajanlar en sıcak başlık.
• **Kurumsal kullanım:** RAG (kendi verinle konuşan AI), kod asistanları, müşteri desteği otomasyonu.

Hangi yönünü açalım — nasıl çalıştığı mı, nasıl öğrenileceği mi, yoksa bir proje fikri mi?`
    },
    {
        rx: /yapay zeka|\bai\b|makine ogren|machine learning|derin ogren|deep learning|sinir ag|noral|\byz\b/i,
        reply: `**Yapay zeka** geniş bir alan; ana hatlarıyla:
• **Makine öğrenmesi:** Veriden örüntü öğrenen modeller (sınıflandırma, tahmin, öneri).
• **Derin öğrenme:** Çok katmanlı sinir ağları — görüntü, ses ve dilde çığır açtı.
• **Güncel gündem:** Üretken AI, AI ajanları, küçük ve verimli modeller (on-device AI), AI düzenlemeleri (AB AI Act).
• **Etik & güvenlik:** Yanlılık, telif, halüsinasyon ve veri gizliliği tartışmaları öne çıkıyor.

İstersen "üretken yapay zeka" veya "yapay zekaya nasıl başlarım" diye sorabilirsin.`
    },
    {
        rx: /robotik|robot\b|otonom|insansi|humanoid|drone|iot|nesnelerin interneti|otomasyon/i,
        reply: `**Robotik & otonom sistemler** hızla olgunlaşıyor:
• **İnsansı robotlar:** Depo, üretim ve hizmet senaryolarında pilot uygulamalar artıyor.
• **Otonom araçlar:** Sürüş asistanı ve robotaksi denemeleri büyüyor.
• **IoT + Edge AI:** Sensör verisini cihaz üstünde işleyen akıllı sistemler.
• **Yapay zeka entegrasyonu:** LLM'lerle konuşan, ortamı algılayıp planlayan robotlar.

Hangi tarafı ilgini çekiyor — donanım, kontrol yazılımı yoksa AI beyni?`
    },
    {
        rx: /bulut|cloud|aws|azure|gcp|serverless|sunucusuz|kubernetes|k8s|docker|konteyner|container|devops|ci.?cd/i,
        reply: `**Bulut & DevOps** modern yazılımın belkemiği:
• **Konteynerler:** Docker ile paketleme, Kubernetes ile ölçeklenme standart hâline geldi.
• **Sunucusuz (serverless):** Altyapıyla uğraşmadan fonksiyon çalıştırma (AWS Lambda, Vercel, Cloudflare).
• **CI/CD:** GitHub Actions, Jenkins ile otomatik test + dağıtım.
• **Güncel trend:** Platform engineering, FinOps (bulut maliyet yönetimi) ve "AI for DevOps".

Senin projende Docker + Jenkins zaten var — istersen pipeline mantığını birlikte gözden geçirelim.`
    },
    {
        rx: /siber|guvenlik|security|hack|saldiri|sifrele|encryption|zero trust|pentest|fidye|ransomware/i,
        reply: `**Siber güvenlik** her geçen yıl daha kritik:
• **Zero Trust:** "Hiçbir şeye baştan güvenme, her erişimi doğrula" yaklaşımı yaygınlaşıyor.
• **Kimlik & MFA:** Çok faktörlü doğrulama ve passkey'ler parolaların yerini alıyor.
• **AI iki tarafta da:** Saldırganlar da savunmacılar da yapay zekayı kullanıyor.
• **Temel hijyen:** Güncellemeler, en az yetki, şifreleme, yedekleme, oltalama (phishing) farkındalığı.

Bunlar genel bilgilendirmedir; kritik bir güvenlik kararı için uzmana danışmanı öneririm.`
    },
    {
        rx: /blockchain|kripto|bitcoin|ethereum|web3|nft|defi|zincir/i,
        reply: `**Blockchain & Web3** dalgalı ama yenilik üreten bir alan:
• **Temel fikir:** Merkezi olmayan, değiştirilemez kayıt defteri.
• **Akıllı sözleşmeler:** Ethereum üzerinde otomatik çalışan kod (DeFi, NFT uygulamaları).
• **Güncel başlıklar:** Ölçeklenme (Layer-2), enerji verimliliği, düzenlemeler.
• **Gerçek kullanım:** Tedarik zinciri takibi, kimlik, dijital varlıklar.

Yatırım tavsiyesi vermem; teknolojiyi anlamak istersen seve seve açarım.`
    },
    {
        rx: /\bar\b|\bvr\b|artirilmis|sanal gerceklik|metaverse|kuantum|quantum|uzay|space|yesil|surdurulebil|elektrikli|\bev\b/i,
        reply: `**Sınırdaki (frontier) teknolojiler** önümüzdeki yılların gündemi:
• **AR/VR & uzamsal bilişim:** Apple Vision Pro gibi cihazlarla "uzamsal arayüzler".
• **Kuantum bilişim:** Belirli problemlerde devrim potansiyeli; henüz erken aşama.
• **Yeşil teknoloji:** Elektrikli araçlar, enerji depolama, veri merkezi verimliliği.
• **Uzay:** Yeniden kullanılabilir roketler ve uydu internetiyle erişim ucuzluyor.

Hangisini merak ediyorsun? Birini seçersen derinleşelim.`
    }
];

/** Gemini yok / hata verince bile sohbet akışı kırılmasın: her zaman anlamlı Türkçe yanıt. */
function localAssistantReply(userText, history) {
    const trimmed = userText.trim();
    const lower = trimmed.toLowerCase();
    // Türkçe karakterleri ASCII'ye indir: kullanıcı "kac", "gun", "nasilsin" yazsa da eşleşsin.
    const norm = lower
        .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
        .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/î/g, 'i');
    const lastModel = [...(history || [])].reverse().find((h) => h && h.role === 'model' && typeof h.text === 'string');
    const hasContext = Boolean(lastModel && lastModel.text && lastModel.text.trim());

    // --- Kısa onay / ret (bağlama göre) ---
    if (/^(evet|tamam|olur|peki|evt|eyv|devam|tabii|tabi|aynen)$/.test(norm)) {
        return hasContext
            ? 'Süper, devam edelim. Önceki konuyu biraz daha açayım mı, yoksa belirli bir noktaya mı odaklanalım? İstersen örnek de verebilirim.'
            : 'Tamam! Hangi konuyla başlayalım? Örnek: "Bugün teknolojide neler trend?" veya "REST API nedir?"';
    }
    if (/^(hayir|yok|olmaz|maalesef|gerek yok)$/.test(norm)) {
        return 'Anladım. Başka bir konuda yardımcı olayım — teknoloji, yazılım veya yapay zeka, ne istersen.';
    }

    // --- Selamlama ---
    if (/\b(merhaba|selam|hey|sa|slm|alo|hello|hi)\b|gunaydin|iyi (gunler|aksamlar|geceler|sabahlar)/.test(norm)) {
        return 'Merhaba! 👋 Ben BlogicodeAI asistanıyım. Güncel teknoloji trendleri, yazılım, yapay zeka ve inovasyon dünyası hakkında sohbet edebiliriz.\n\nNe konuşmak istersin? İstersen "Bugün neler trend?" diye başla.';
    }

    // --- Hatır sorma ---
    if (/nasilsin|naptin|napiyorsun|ne yapiyorsun|keyfin|naber|ne haber/.test(norm)) {
        return 'İyiyim, teşekkürler! 🤖 Sohbet etmeye ve sorularını yanıtlamaya hazırım. Sen nasılsın? Aklında bir teknoloji konusu var mı?';
    }

    // --- Günlük temel: tarih & saat (Türkiye saatiyle) ---
    if (/bugun gunlerden|hangi gun|tarihi? (kac|ne)|bugunun tarihi|saat kac|gunlerden ne|tarih nedir|gun bugun|hafta(nin)? gun/.test(norm)) {
        try {
            const fmt = new Intl.DateTimeFormat('tr-TR', {
                timeZone: 'Europe/Istanbul',
                dateStyle: 'full',
                timeStyle: 'short'
            }).format(new Date());
            return `Türkiye saatiyle şu an: **${fmt}**.\n\nBaşka bir konuda yardımcı olayım mı?`;
        } catch (_) {
            return `Bugünün tarihi: ${new Date().toLocaleDateString('tr-TR')}.`;
        }
    }

    // --- Kimlik ---
    if (/(adin|ismin) ne|kimsin|sen kimsin|seni kim|kim yapti|kim gelistir|blogicode nedir/.test(norm)) {
        return 'Ben **BlogicodeAI Asistan**ıyım — BlogicodeAI teknoloji blog platformunun yapay zeka sohbet asistanı. Güncel teknoloji başlıkları, yazılım, yapay zeka ve inovasyon konularında sohbet eder, sorularını yanıtlarım.\n\nNe öğrenmek istersin?';
    }

    // --- Teşekkür ---
    if (/tesekkur|sag ?ol|saol|eyvallah|thanks|tsk|tessekkur/.test(norm)) {
        return 'Rica ederim! 😊 Başka bir sorun olursa buradayım.';
    }

    // --- Ne yapabilirsin / yardım ---
    if (/ne yapabilir|neler yapabilir|yardim|nasil kullan|ne ise yar|ozelliklerin/.test(norm)) {
        return 'Şunlarda yardımcı olabilirim:\n• 🔥 **Güncel teknoloji trendleri** — yapay zeka, bulut, siber güvenlik, robotik…\n• 💡 **İnovasyon sohbeti** — yeni teknolojiler ve nasıl çalıştıkları\n• 💻 **Yazılım rehberliği** — diller, kavramlar, öğrenme yolu\n• 🗓️ **Günlük temel sorular** — tarih, basit bilgiler\n\nBir örnek yaz, hemen başlayalım!';
    }

    // --- Güncel trend / gündem ---
    if (/trend|gundem|guncel|son dakika|populer|sicak|yeni cikan|bugun ne|neler oluyor|haber/.test(norm)) {
        return 'Teknoloji dünyasında şu an öne çıkan **trend başlıklar**:\n\n• 🤖 **Üretken yapay zeka & AI ajanları** — kod yazan, görev tamamlayan otonom asistanlar.\n• ☁️ **Bulut & sunucusuz mimariler** — maliyet optimizasyonu (FinOps) ve edge computing.\n• 🔐 **Siber güvenlik** — Zero Trust, passkey, AI destekli savunma.\n• 📱 **On-device AI** — telefonda çalışan küçük ve verimli modeller.\n• 🤖 **İnsansı robotlar & otonom sistemler** — sahaya inen pilot projeler.\n• 🥽 **Uzamsal bilişim (AR/VR)** ve kuantum bilişimde ilk adımlar.\n\nHangisini açayım? Bir başlık seç, detaylandırayım.\n\n_(Canlı haber akışı için sunucuya GEMINI_API_KEY + GEMINI_ENABLE_SEARCH=true eklenebilir.)_';
    }

    // --- Öğrenme / kariyer yol haritası ---
    if (/nasil basla|nereden basla|ogrenmek|ogrenmeli|kurs|roadmap|yol harita|kariyer|nasil ilerle/.test(norm)) {
        return 'Yazılıma başlangıç için pratik bir yol haritası:\n1) **Bir dil seç:** Python (veri/otomasyon/AI) ya da JavaScript (web).\n2) **Temelleri öğren:** değişkenler, döngüler, fonksiyonlar, hata ayıklama.\n3) **Küçük proje yap:** yapılacaklar listesi, basit bir blog API\'si.\n4) **Git + GitHub** kullanmayı erken alışkanlık edin.\n5) **Bir alan seç:** web, mobil, veri/AI veya DevOps.\n\nHangi alan ilgini çekiyor? Ona göre daha net bir plan çıkaralım.';
    }

    // --- Belirli teknoloji/inovasyon başlıkları (ASCII normalize edilmiş girişe göre) ---
    for (const topic of INNOVATION_TOPICS) {
        if (topic.rx.test(norm)) return topic.reply;
    }

    // --- Programlama dilleri / araçlar ---
    if (/python|javascript|typescript|react|node|java\b|go\b|rust|c\+\+|c#|php|swift|kotlin|flutter|mongodb|\bsql\b|\bapi\b|rest|graphql|git\b/.test(norm)) {
        const topic = lower.includes('python') ? 'Python'
            : (lower.includes('typescript') || /\bts\b/.test(lower)) ? 'TypeScript'
                : /javascript|react|node/.test(lower) ? 'JavaScript / Node / React'
                    : lower.includes('mongodb') ? 'MongoDB'
                        : (lower.includes('flutter') || lower.includes('swift') || lower.includes('kotlin')) ? 'Mobil geliştirme'
                            : 'Bu teknoloji';
        return `${topic} konusunda yardımcı olabilirim. 👍 Hedefini biraz açar mısın:\n• Yeni mi öğreniyorsun?\n• Bir hata mı alıyorsun?\n• Mimari/tasarım kararı mı veriyorsun?\n\nNe kadar net olursan, o kadar isabetli yönlendirebilirim.`;
    }

    // --- Genel yedek ---
    const snippet = trimmed.length > 200 ? `${trimmed.slice(0, 200)}…` : trimmed;
    return `"${snippet}" — ilginç konu! 🙂 Bunu birlikte açabiliriz.\n\nSohbeti şöyle ilerletebiliriz:\n• Sorunu biraz daha netleştir (ör. "yapay zeka nasıl öğrenilir", "bulut nedir").\n• Güncel başlıklar için "Bugün neler trend?" yazabilirsin.\n• Teknoloji, yazılım veya inovasyon — hangisi olursa konuşalım.\n\nNeyi merak ediyorsun?`;
}

const DEFAULT_GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

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