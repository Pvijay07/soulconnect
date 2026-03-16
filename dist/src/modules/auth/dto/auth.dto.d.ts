export declare class RegisterDto {
    email?: string;
    phone?: string;
    password: string;
    displayName?: string;
    isAnonymous?: boolean;
}
export declare class LoginDto {
    email?: string;
    phone?: string;
    password: string;
}
export declare class SendOtpDto {
    phone: string;
    purpose?: string;
}
export declare class VerifyOtpDto {
    phone: string;
    otp: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class GoogleAuthDto {
    idToken: string;
}
export declare class AppleAuthDto {
    identityToken: string;
    fullName?: string;
}
