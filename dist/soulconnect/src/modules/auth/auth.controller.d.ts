import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
            user: {
                id: string;
                email: string;
                phone: string;
                role: import("../users/entities/user.entity").UserRole;
                isAnonymous: boolean;
            };
        };
    }>;
    login(dto: LoginDto): Promise<{
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
            user: {
                id: string;
                email: string;
                phone: string;
                role: import("../users/entities/user.entity").UserRole;
                isAnonymous: boolean;
            };
        };
    }>;
    sendOtp(dto: SendOtpDto): Promise<{
        data: {
            message: string;
            expiresIn: number;
            retryAfter: number;
        };
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        data: {
            isNewUser: boolean;
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
            user: {
                id: string;
                phone: string;
                role: import("../users/entities/user.entity").UserRole;
            };
        };
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    me(req: any): Promise<{
        data: {
            id: string;
            email: string;
            phone: string;
            role: import("../users/entities/user.entity").UserRole;
            isAnonymous: boolean;
            profile: any;
            wallet: {
                balance: any;
                currency: any;
            } | null;
        };
    }>;
    updateProfile(req: any, dto: {
        displayName?: string;
        bio?: string;
    }): Promise<{
        data: import("../users/entities/profile.entity").Profile;
    }>;
}
