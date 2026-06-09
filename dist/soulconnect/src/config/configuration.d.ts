declare const _default: () => {
    port: number;
    apiPrefix: string;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    jwt: {
        secret: string;
        accessExpiry: string;
        refreshExpiry: string;
    };
    otp: {
        expiry: number;
        length: number;
    };
    twilio: {
        accountSid: string;
        authToken: string;
        phoneNumber: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
    };
    razorpay: {
        keyId: string;
        keySecret: string;
        webhookSecret: string;
    };
    aws: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        s3Bucket: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
    };
    platform: {
        commissionRate: number;
        minCallBalanceMinutes: number;
        callReconnectTimeout: number;
        maxActiveSessions: number;
    };
};
export default _default;
