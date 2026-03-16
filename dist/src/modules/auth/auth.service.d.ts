import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly userRepo;
    private readonly profileRepo;
    private readonly walletRepo;
    private readonly jwtService;
    private readonly configService;
    private twilioClient;
    private otps;
    constructor(userRepo: Repository<User>, profileRepo: Repository<Profile>, walletRepo: Repository<Wallet>, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            phone: string;
            role: UserRole;
            isAnonymous: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            phone: string;
            role: UserRole;
            isAnonymous: boolean;
        };
    }>;
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
        expiresIn: number;
        retryAfter: number;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        isNewUser: boolean;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            phone: string;
            role: UserRole;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        phone: string;
        role: UserRole;
        isAnonymous: boolean;
        profile: any;
        wallet: {
            balance: any;
            currency: any;
        } | null;
    }>;
    updateProfile(userId: string, dto: {
        displayName?: string;
        bio?: string;
    }): Promise<Profile>;
    private generateTokens;
}
