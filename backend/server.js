require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const app = express();

// ── 미들웨어 ──────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'x-bot-key']
}));
app.use(express.json());

// ── Rate Limiting ────────────────────────────────
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15분
    max: 10,                    // 10회
    message: { success: false, message: '너무 많은 시도입니다. 15분 후 다시 시도하세요.' }
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,   // 1분
    max: 60                     // 60회
});

// ── 정적 파일 (프론트엔드) ────────────────────────
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ── API 라우터 ────────────────────────────────────
app.use('/api/auth',     loginLimiter, require('./routes/auth'));
app.use('/api/settings', apiLimiter,   require('./routes/settings'));
app.use('/api/admin',    apiLimiter,   require('./routes/admin'));

// ── SPA 폴백 (새로고침 대응) ──────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// ── MongoDB 연결 및 서버 시작 ─────────────────────
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas 연결 완료');
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`🚀 웹 패널 서버 실행 중: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB 연결 실패:', err.message);
        process.exit(1);
    });