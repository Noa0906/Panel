const mongoose = require('mongoose');

const botSettingsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },

    // ── 기본 설정 ──────────────────────────────────
    prefix: {
        type: String,
        default: '!'
    },
    language: {
        type: String,
        default: 'ko',
        enum: ['ko', 'en']
    },
    logChannelId: {
        type: String,
        default: null
    },

    // ── 환영 메시지 ────────────────────────────────
    welcomeChannelId: {
        type: String,
        default: null
    },
    welcomeEnabled: {
        type: Boolean,
        default: false
    },
    welcomeMessage: {
        type: String,
        default: '{user}님, 서버에 오신 것을 환영합니다!'
    },

    // ── 자동 역할 ──────────────────────────────────
    autoRoleEnabled: {
        type: Boolean,
        default: false
    },
    autoRoleId: {
        type: String,
        default: null
    },

    // ── 욕설 필터 ──────────────────────────────────
    filterEnabled: {
        type: Boolean,
        default: false
    },
    filterWords: {
        type: [String],
        default: []
    },

    // ── 레벨 시스템 ────────────────────────────────
    levelEnabled: {
        type: Boolean,
        default: false
    },
    levelChannelId: {
        type: String,
        default: null
    },
    xpPerMessage: {
        type: Number,
        default: 10,
        min: 1,
        max: 100
    },

    // ── 뮤직 ──────────────────────────────────────
    musicEnabled: {
        type: Boolean,
        default: true
    },
    maxQueueSize: {
        type: Number,
        default: 50,
        min: 1,
        max: 500
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'bot_settings'
});

// 저장 시 updatedAt 자동 갱신
botSettingsSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('BotSettings', botSettingsSchema);