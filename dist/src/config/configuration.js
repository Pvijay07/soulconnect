"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'soulconnect_dev_2026',
        name: process.env.DB_NAME || 'soul_db',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-key',
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
    },
    otp: {
        expiry: parseInt(process.env.OTP_EXPIRY_SECONDS || '60', 10),
        length: parseInt(process.env.OTP_LENGTH || '6', 10),
    },
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || '',
        keySecret: process.env.RAZORPAY_KEY_SECRET || '',
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    },
    aws: {
        region: process.env.AWS_REGION || 'ap-south-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        s3Bucket: process.env.AWS_S3_BUCKET || 'soulconnect-uploads',
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    platform: {
        commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.30'),
        minCallBalanceMinutes: parseInt(process.env.MIN_CALL_BALANCE_MINUTES || '2', 10),
        callReconnectTimeout: parseInt(process.env.CALL_RECONNECT_TIMEOUT_SECONDS || '30', 10),
        maxActiveSessions: parseInt(process.env.MAX_ACTIVE_SESSIONS || '5', 10),
    },
});
//# sourceMappingURL=configuration.js.map