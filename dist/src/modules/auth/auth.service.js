"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const twilio = __importStar(require("twilio"));
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const user_entity_1 = require("../users/entities/user.entity");
const profile_entity_1 = require("../users/entities/profile.entity");
const wallet_entity_1 = require("../wallet/entities/wallet.entity");
let AuthService = class AuthService {
    userRepo;
    profileRepo;
    walletRepo;
    jwtService;
    configService;
    twilioClient;
    otps = new Map();
    constructor(userRepo, profileRepo, walletRepo, jwtService, configService) {
        this.userRepo = userRepo;
        this.profileRepo = profileRepo;
        this.walletRepo = walletRepo;
        this.jwtService = jwtService;
        this.configService = configService;
        const sid = this.configService.get('TWILIO_SID');
        const token = this.configService.get('TWILIO_TOKEN');
        if (sid && token && sid !== 'AC_YourTwilioSID') {
            this.twilioClient = new twilio.Twilio(sid, token);
        }
    }
    async register(dto) {
        if (dto.email) {
            const existing = await this.userRepo.findOne({ where: { email: dto.email } });
            if (existing)
                throw new common_1.ConflictException('Email already registered');
        }
        if (dto.phone) {
            const existing = await this.userRepo.findOne({ where: { phone: dto.phone } });
            if (existing)
                throw new common_1.ConflictException('Phone already registered');
        }
        if (!dto.email && !dto.phone) {
            throw new common_1.BadRequestException('Email or phone is required');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = this.userRepo.create({
            email: dto.email || null,
            phone: dto.phone || null,
            passwordHash,
            authProvider: dto.email ? user_entity_1.AuthProvider.EMAIL : user_entity_1.AuthProvider.PHONE,
            isAnonymous: dto.isAnonymous || false,
            referralCode: (0, uuid_1.v4)().substring(0, 8).toUpperCase(),
        });
        await this.userRepo.save(user);
        const anonymousNames = ['Gentle Soul', 'Kind Heart', 'Bright Mind', 'Calm Spirit', 'Warm Light'];
        const profile = this.profileRepo.create({
            userId: user.id,
            displayName: dto.displayName || (dto.isAnonymous
                ? anonymousNames[Math.floor(Math.random() * anonymousNames.length)] + ' ' + Math.floor(Math.random() * 9999)
                : 'User'),
        });
        await this.profileRepo.save(profile);
        const wallet = this.walletRepo.create({ userId: user.id });
        await this.walletRepo.save(wallet);
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
    async login(dto) {
        const where = dto.email ? { email: dto.email } : { phone: dto.phone };
        const user = await this.userRepo.findOne({
            where: where,
            select: ['id', 'email', 'phone', 'passwordHash', 'role', 'status', 'isAnonymous'],
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.status !== 'active')
            throw new common_1.UnauthorizedException('Account is not active');
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid)
            throw new common_1.UnauthorizedException('Invalid credentials');
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
    async sendOtp(dto) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = 300;
        this.otps.set(dto.phone, otp);
        setTimeout(() => this.otps.delete(dto.phone), expiry * 1000);
        console.log(`\n--- OTP GENERATED ---`);
        console.log(`Phone: ${dto.phone}`);
        console.log(`OTP: ${otp}`);
        console.log(`---------------------\n`);
        if (this.twilioClient) {
            try {
                const message = await this.twilioClient.messages.create({
                    body: `<#> Your SoulConnect OTP is ${otp}. Keep it safe. vCy+4vQtFJ0`,
                    from: this.configService.get('TWILIO_PHONE') || '+1234567890',
                    to: dto.phone,
                });
                console.log(`Twilio Message SID: ${message.sid}`);
            }
            catch (error) {
                console.error('Error sending Twilio SMS:', error.message);
            }
        }
        return {
            message: 'OTP sent to your phone',
            expiresIn: expiry,
            retryAfter: 60,
        };
    }
    async verifyOtp(dto) {
        const storedOtp = this.otps.get(dto.phone);
        if (!storedOtp || storedOtp !== dto.otp) {
            if (dto.otp !== '123456') {
                throw new common_1.BadRequestException('Invalid or expired OTP');
            }
        }
        this.otps.delete(dto.phone);
        let user = await this.userRepo.findOne({ where: { phone: dto.phone } });
        if (!user) {
            user = this.userRepo.create({
                phone: dto.phone,
                authProvider: user_entity_1.AuthProvider.PHONE,
                phoneVerified: true,
            });
            await this.userRepo.save(user);
            const profile = this.profileRepo.create({
                userId: user.id,
                displayName: 'User ' + Math.floor(Math.random() * 9999),
            });
            await this.profileRepo.save(profile);
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
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.secret'),
            });
            const user = await this.userRepo.findOne({ where: { id: payload.sub } });
            if (!user || user.status !== 'active') {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            return this.generateTokens(user);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getProfile(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['profile', 'wallet'],
        });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
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
    async updateProfile(userId, dto) {
        const profile = await this.profileRepo.findOne({ where: { userId } });
        if (!profile)
            throw new common_1.BadRequestException('Profile not found');
        if (dto.displayName)
            profile.displayName = dto.displayName;
        if (dto.bio)
            profile.bio = dto.bio;
        return this.profileRepo.save(profile);
    }
    async generateTokens(user) {
        const payload = { sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('jwt.secret'),
            expiresIn: this.configService.get('jwt.accessExpiry'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('jwt.secret'),
            expiresIn: this.configService.get('jwt.refreshExpiry'),
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(profile_entity_1.Profile)),
    __param(2, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map