export declare enum UserRole {
    USER = "user",
    LISTENER = "listener",
    ADMIN = "admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    BANNED = "banned",
    DELETED = "deleted"
}
export declare enum AuthProvider {
    EMAIL = "email",
    PHONE = "phone",
    GOOGLE = "google",
    APPLE = "apple"
}
export declare class User {
    id: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: UserRole;
    status: UserStatus;
    authProvider: AuthProvider;
    providerId: string;
    isAnonymous: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    referralCode: string;
    callCount: number;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    profile: any;
    listenerProfile: any;
    wallet: any;
}
