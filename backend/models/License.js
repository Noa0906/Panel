const mongoose = require('mongoose');

// 봇 호스팅의 ActiveLicense 모델과 같은 컬렉션(licenses)을 공유합니다.
const licenseSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    guildName: {
        type: String,
        default: '알 수 없음'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: null      // null = 영구 라이선스
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    collection: 'licenses'  // 봇과 같은 컬렉션 공유
});

module.exports = mongoose.model('License', licenseSchema);