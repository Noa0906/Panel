const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const License = require('../models/License');

// ── POST /api/auth/login ──────────────────────────
// 라이선스 키로 로그인 → JWT 발급
router.post('/login', async (req, res) => {
    try {
        const { licenseKey } = req.body;
        if (!licenseKey || typeof licenseKey !== 'string') {
            return res.status(400).json({ success: false, message: '라이선스 키를 입력해주세요.' });
        }

        const license = await License.findOne({
            key:      licenseKey.trim().toUpperCase(),
            isActive: true
        });

        if (!license) {
            return res.status(401).json({ success: false, message: '유효하지 않은 라이선스 키입니다.' });
        }
        if (license.expiresAt && license.expiresAt < new Date()) {
            return res.status(401).json({ success: false, message: '만료된 라이선스입니다.' });
        }

        // 마지막 로그인 시간 업데이트
        license.lastLogin = new Date();
        await license.save();

        // JWT 발급
        const token = jwt.sign(
            { guildId: license.guildId, guildName: license.guildName },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            token,
            guild: {
                id:        license.guildId,
                name:      license.guildName,
                expiresAt: license.expiresAt
            }
        });

    } catch (err) {
        console.error('[auth/login]', err.message);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// ── POST /api/auth/verify ─────────────────────────
// 저장된 JWT 토큰 유효성 재확인 (페이지 새로고침 시 사용)
router.post('/verify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, valid: false });
        }

        const token   = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const license = await License.findOne({ guildId: decoded.guildId, isActive: true });
        if (!license) {
            return res.status(401).json({ success: false, valid: false });
        }

        res.json({
            success: true,
            valid: true,
            guild: {
                id:        license.guildId,
                name:      license.guildName,
                expiresAt: license.expiresAt
            }
        });

    } catch {
        res.status(401).json({ success: false, valid: false });
    }
});

module.exports = router;