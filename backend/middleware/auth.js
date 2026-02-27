const jwt     = require('jsonwebtoken');
const License = require('../models/License');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: '인증 토큰이 없습니다.' });
        }

        const token   = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 라이선스가 여전히 유효한지 DB 재확인
        const license = await License.findOne({ guildId: decoded.guildId, isActive: true });
        if (!license) {
            return res.status(401).json({ success: false, message: '라이선스가 비활성화되었습니다.' });
        }
        if (license.expiresAt && license.expiresAt < new Date()) {
            return res.status(401).json({ success: false, message: '라이선스가 만료되었습니다.' });
        }

        req.guildId = decoded.guildId;
        req.license = license;
        next();

    } catch {
        return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
    }
};