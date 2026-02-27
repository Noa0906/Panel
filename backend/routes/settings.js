const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middleware/auth');
const BotSettings    = require('../models/BotSettings');

// 웹 패널 → 인증 필요
router.use(authMiddleware);

// ── GET /api/settings ──────────────────────────────
// 현재 서버의 봇 설정 불러오기
router.get('/', async (req, res) => {
    try {
        let settings = await BotSettings.findOne({ guildId: req.guildId });
        if (!settings) {
            settings = await BotSettings.create({ guildId: req.guildId });
        }
        res.json({ success: true, settings });
    } catch (err) {
        console.error('[settings/GET]', err.message);
        res.status(500).json({ success: false, message: '설정을 불러오는 중 오류가 발생했습니다.' });
    }
});

// ── PUT /api/settings ──────────────────────────────
// 봇 설정 저장
router.put('/', async (req, res) => {
    try {
        // 허용된 필드만 업데이트
        const allowed = [
            'prefix', 'language',
            'logChannelId', 'welcomeChannelId',
            'welcomeEnabled', 'welcomeMessage',
            'autoRoleEnabled', 'autoRoleId',
            'filterEnabled', 'filterWords',
            'levelEnabled', 'levelChannelId', 'xpPerMessage',
            'musicEnabled', 'maxQueueSize'
        ];

        const updateData = { updatedAt: new Date() };
        for (const key of allowed) {
            if (req.body[key] !== undefined) updateData[key] = req.body[key];
        }

        const settings = await BotSettings.findOneAndUpdate(
            { guildId: req.guildId },
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({ success: true, settings, message: '설정이 저장되었습니다.' });
    } catch (err) {
        console.error('[settings/PUT]', err.message);
        res.status(500).json({ success: false, message: '설정 저장 중 오류가 발생했습니다.' });
    }
});

// ── GET /api/settings/bot/:guildId ─────────────────
// 봇 호스팅에서 설정을 읽어가는 전용 엔드포인트 (x-bot-key 인증)
router.get('/bot/:guildId', async (req, res) => {
    const botKey = req.headers['x-bot-key'];
    if (!botKey || botKey !== process.env.BOT_API_KEY) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    try {
        let settings = await BotSettings.findOne({ guildId: req.params.guildId });
        if (!settings) {
            settings = await BotSettings.create({ guildId: req.params.guildId });
        }
        res.json({ success: true, settings });
    } catch (err) {
        console.error('[settings/bot]', err.message);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

module.exports = router;