import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import * as twilio from 'twilio';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, AuthProvider } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    private twilioClient: any;
    private otps = new Map<string, string>();

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Profile)
        private readonly profileRepo: Repository<Profile>,
        @InjectRepository(Wallet)
        private readonly walletRepo: Repository<Wallet>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { 
        const sid = this.configService.get<string>('TWILIO_SID');
        const token = this.configService.get<string>('TWILIO_TOKEN');
        if (sid && token && sid !== 'AC_YourTwilioSID') {
            this.twilioClient = new twilio.Twilio(sid, token);
        }
    }

    async register(dto: RegisterDto) {
        // Check for existing user
        if (dto.email) {
            const existing = await this.userRepo.findOne({ where: { email: dto.email } });
            if (existing) throw new ConflictException('Email already registered');
        }
        if (dto.phone) {
            const existing = await this.userRepo.findOne({ where: { phone: dto.phone } });
            if (existing) throw new ConflictException('Phone already registered');
        }

        if (!dto.email && !dto.phone) {
            throw new BadRequestException('Email or phone is required');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // Create user
        const user = (this.userRepo.create({
            email: dto.email || null,
            phone: dto.phone || null,
            passwordHash,
            authProvider: dto.email ? AuthProvider.EMAIL : AuthProvider.PHONE,
            isAnonymous: dto.isAnonymous || false,
            referralCode: uuidv4().substring(0, 8).toUpperCase(),
        } as any) as unknown) as User; // Double cast to bypass strict array check
        await this.userRepo.save(user);

        // Create profile
        const anonymousNames = ['Gentle Soul', 'Kind Heart', 'Bright Mind', 'Calm Spirit', 'Warm Light'];
        const profile = this.profileRepo.create({
            userId: user.id,
            displayName: dto.displayName || (dto.isAnonymous
                ? anonymousNames[Math.floor(Math.random() * anonymousNames.length)] + ' ' + Math.floor(Math.random() * 9999)
                : 'User'),
        });
        await this.profileRepo.save(profile);

        // Create wallet
        const wallet = this.walletRepo.create({ userId: user.id });
        await this.walletRepo.save(wallet);

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isAnonymous: user.isAnonymous,
            },
            ...tokens,
        };
    }

    async login(dto: LoginDto) {
        const where = dto.email ? { email: dto.email } : { phone: dto.phone };
        const user = await this.userRepo.findOne({
            where: where as any,
            select: ['id', 'email', 'phone', 'passwordHash', 'role', 'status', 'isAnonymous'] as any,
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');
        if (user.status !== 'active') throw new UnauthorizedException('Account is not active');

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        // Update last login
        await this.userRepo.update(user.id, { lastLoginAt: new Date() });

        const tokens = await this.generateTokens(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isAnonymous: user.isAnonymous,
            },
            ...tokens,
        };
    }

    async sendOtp(dto: SendOtpDto) {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = 300; // 5 minutes

        // Store OTP in memory
        this.otps.set(dto.phone, otp);
        setTimeout(() => this.otps.delete(dto.phone), expiry * 1000);

        // For real apps, OTP should NEVER be returned in response.
        // Log it to console for your local debugging:
        console.log(`\n--- OTP GENERATED ---`);
        console.log(`Phone: ${dto.phone}`);
        console.log(`OTP: ${otp}`);
        console.log(`---------------------\n`);

        // Real Twilio sending if credentials exist
        if (this.twilioClient) {
            try {
                const message = await this.twilioClient.messages.create({
                    body: `<#> Your SoulConnect OTP is ${otp}. Keep it safe. vCy+4vQtFJ0`, // Updated for current app signature
                    from: this.configService.get<string>('TWILIO_PHONE') || '+1234567890',
                    to: dto.phone,
                });
                console.log(`Twilio Message SID: ${message.sid}`);
            } catch (error) {
                console.error('Error sending Twilio SMS:', error.message);
                // In production, you might not want to continue, but for local/testing:
            }
        }

        return {
            message: 'OTP sent to your phone',
            expiresIn: expiry,
            retryAfter: 60,
        };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        const storedOtp = this.otps.get(dto.phone);
        
        if (!storedOtp || storedOtp !== dto.otp) {
            // Allow '123456' for easier testing in dev if needed, or just be strict
            if (dto.otp !== '123456') { // BACKDOOR FOR TESTING
                throw new BadRequestException('Invalid or expired OTP');
            }
        }

        // Clear OTP after use
        this.otps.delete(dto.phone);

        // Find or create user by phone
        let user = await this.userRepo.findOne({ where: { phone: dto.phone } });

        if (!user) {
            // Auto-register on first OTP verification
            user = this.userRepo.create({
                phone: dto.phone,
                authProvider: AuthProvider.PHONE,
                phoneVerified: true,
            });
            await this.userRepo.save(user);

            // Create profile
            const profile = this.profileRepo.create({
                userId: user.id,
                displayName: 'User ' + Math.floor(Math.random() * 9999),
            });
            await this.profileRepo.save(profile);

            // Create wallet
            const wallet = this.walletRepo.create({ userId: user.id });
            await this.walletRepo.save(wallet);
        }

        await this.userRepo.update(user.id, { lastLoginAt: new Date(), phoneVerified: true });

        const tokens = await this.generateTokens(user);

        return {
            user: {
                id: user.id,
                phone: user.phone,
                role: user.role,
            },
            ...tokens,
            isNewUser: !user.lastLoginAt,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('jwt.secret'),
            });

            const user = await this.userRepo.findOne({ where: { id: payload.sub } });
            if (!user || user.status !== 'active') {
                throw new UnauthorizedException('Invalid refresh token');
            }

            return this.generateTokens(user);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async getProfile(userId: string) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['profile', 'wallet'],
        });
        if (!user) throw new UnauthorizedException('User not found');

        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isAnonymous: user.isAnonymous,
            profile: user.profile,
            wallet: user.wallet ? { balance: user.wallet.balance, currency: user.wallet.currency } : null,
        };
    }

    async updateProfile(userId: string, dto: { displayName?: string; bio?: string }) {
        const profile = await this.profileRepo.findOne({ where: { userId } });
        if (!profile) throw new BadRequestException('Profile not found');

        if (dto.displayName) profile.displayName = dto.displayName;
        if (dto.bio) profile.bio = dto.bio;

        return this.profileRepo.save(profile);
    }

    private async generateTokens(user: User) {
        const payload = { sub: user.id, role: user.role };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('jwt.secret'),
            expiresIn: this.configService.get<string>('jwt.accessExpiry'),
        } as any);

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('jwt.secret'),
            expiresIn: this.configService.get<string>('jwt.refreshExpiry'),
        } as any);

        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes in seconds
        };
    }
}
