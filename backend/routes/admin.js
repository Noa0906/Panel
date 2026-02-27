const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const License = require('../models/License');

// ── 관리자 인증 미들웨어 ──────────────────────────
const adminAuth = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
};

router.use(adminAuth);

// ── POST /api/admin/license ────────────────────────
// 새 라이선스 키 생성
router.post('/license', async (req, res) => {
    try {
        const { guildId, guildName, expiresAt } = req.body;
        if (!guildId) {
            return res.status(400).json({ success: false, message: 'guildId가 필요합니다.' });
        }

        // 키 형식: XXXX-XXXX-XXXX-XXXX
        const raw = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 16);
        const key = `${raw.slice(0,4)}-${raw.slice(4,8)}-${raw.slice(8,12)}-${raw.slice(12,16)}`;

        const license = await License.create({
            key,
            guildId,
            guildName: guildName || '알 수 없음',
            expiresAt: expiresAt ? new Date(expiresAt) : null
        });

        res.json({ success: true, license });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: '이미 존재하는 guildId입니다.' });
        }
        console.error('[admin/license POST]', err.message);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

// ── GET /api/admin/license ─────────────────────────
// 전체 라이선스 목록 조회
router.get('/license', async (req, res) => {
    try {
        const licenses = await License.find().sort({ createdAt: -1 });
        res.json({ success: true, licenses });
    } catch (err) {
        console.error('[admin/license GET]', err.message);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

// ── DELETE /api/admin/license/:guildId ────────────
// 라이선스 비활성화
router.delete('/license/:guildId', async (req, res) => {
    try {
        await License.findOneAndUpdate(
            { guildId: req.params.guildId },
            { isActive: false }
        );
        res.json({ success: true, message: '라이선스가 비활성화되었습니다.' });
    } catch (err) {
        console.error('[admin/license DELETE]', err.message);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

module.exports = router;