"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const listener_profile_entity_1 = require("./entities/listener-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const social_entity_1 = require("../users/entities/social.entity");
const wallet_entity_1 = require("../wallet/entities/wallet.entity");
let ListenersService = class ListenersService {
    listenerRepo;
    userRepo;
    ratingRepo;
    walletRepo;
    constructor(listenerRepo, userRepo, ratingRepo, walletRepo) {
        this.listenerRepo = listenerRepo;
        this.userRepo = userRepo;
        this.ratingRepo = ratingRepo;
        this.walletRepo = walletRepo;
    }
    async apply(userId, data) {
        let profile = await this.listenerRepo.findOne({ where: { userId } });
        if (profile) {
            if (profile.approvalStatus === 'approved')
                throw new common_1.BadRequestException('Already an approved listener');
        }
        else {
            profile = this.listenerRepo.create({ userId });
        }
        Object.assign(profile, {
            headline: data.headline,
            description: data.description,
            expertiseTags: data.expertiseTags || [],
            languages: data.languages || ['en'],
            voiceRatePerMin: data.voiceRatePerMin || 10,
            videoRatePerMin: data.videoRatePerMin || 20,
            gender: data.gender,
            age: data.age,
            identityDocUrl: data.identityDocUrl,
            certificateUrl: data.certificateUrl,
            introVideoUrl: data.introVideoUrl,
            approvalStatus: 'pending',
            isApproved: false,
        });
        await this.listenerRepo.save(profile);
        return profile;
    }
    async getAdminPending(page = 1, limit = 20) {
        const [items, total] = await this.listenerRepo.findAndCount({
            where: { approvalStatus: 'pending' },
            relations: ['user', 'user.profile'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, hasNext: page * limit < total };
    }
    async approveListener(id) {
        let profile = await this.listenerRepo.findOne({ where: { userId: id } });
        if (!profile) {
            profile = await this.listenerRepo.findOne({ where: { id } });
        }
        if (!profile)
            throw new common_1.NotFoundException('Listener profile not found');
        profile.approvalStatus = 'approved';
        profile.isApproved = true;
        profile.isVerified = true;
        await this.listenerRepo.save(profile);
        await this.userRepo.update(profile.userId, { role: user_entity_1.UserRole.LISTENER });
        return profile;
    }
    async rejectListener(id, reason) {
        let profile = await this.listenerRepo.findOne({ where: { userId: id } });
        if (!profile) {
            profile = await this.listenerRepo.findOne({ where: { id } });
        }
        if (!profile)
            throw new common_1.NotFoundException('Listener profile not found');
        profile.approvalStatus = 'rejected';
        profile.isApproved = false;
        profile.rejectionReason = reason;
        await this.listenerRepo.save(profile);
        return profile;
    }
    async browse(filters) {
        const qb = this.listenerRepo
            .createQueryBuilder('lp')
            .leftJoinAndSelect('lp.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('lp.isApproved = :approved', { approved: true })
            .andWhere('user.status = :status', { status: 'active' });
        if (filters.language) {
            qb.andWhere('lp.languages LIKE :lang', { lang: `%${filters.language}%` });
        }
        if (filters.minRating) {
            qb.andWhere('lp.avgRating >= :minRating', { minRating: filters.minRating });
        }
        if (filters.maxRate) {
            qb.andWhere('lp.voiceRatePerMin <= :maxRate', { maxRate: filters.maxRate });
        }
        if (filters.category) {
            qb.andWhere('lp.expertiseTags LIKE :cat', { cat: `%${filters.category}%` });
        }
        switch (filters.sort) {
            case 'rating':
                qb.orderBy('lp.avgRating', 'DESC');
                break;
            case 'price_low':
                qb.orderBy('lp.voiceRatePerMin', 'ASC');
                break;
            case 'price_high':
                qb.orderBy('lp.voiceRatePerMin', 'DESC');
                break;
            case 'popular':
                qb.orderBy('lp.totalCalls', 'DESC');
                break;
            default: qb.orderBy('lp.avgRating', 'DESC');
        }
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        qb.skip((page - 1) * limit).take(limit);
        const [listeners, total] = await qb.getManyAndCount();
        return {
            listeners: listeners.map(lp => ({
                id: lp.userId,
                displayName: lp.user?.profile?.displayName,
                avatarUrl: lp.user?.profile?.avatarUrl,
                headline: lp.headline,
                expertiseTags: lp.expertiseTags,
                voiceRatePerMin: lp.voiceRatePerMin,
                videoRatePerMin: lp.videoRatePerMin,
                avgRating: lp.avgRating,
                totalRatings: lp.totalRatings,
                isAvailable: lp.isAvailable,
                isVerified: lp.isVerified,
            })),
            pagination: { page, limit, total, hasNext: page * limit < total },
        };
    }
    async getDetail(listenerId) {
        const lp = await this.listenerRepo.findOne({
            where: { userId: listenerId },
            relations: ['user', 'user.profile'],
        });
        if (!lp)
            throw new common_1.NotFoundException('Listener not found');
        const reviews = await this.ratingRepo.find({
            where: { revieweeId: listenerId, isVisible: true },
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['reviewer', 'reviewer.profile'],
        });
        return {
            ...lp,
            reviews: reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                reviewText: r.reviewText,
                createdAt: r.createdAt,
                reviewerName: r.reviewer?.profile?.displayName || 'Unknown User',
                reviewerAvatar: r.reviewer?.profile?.avatarUrl,
            })),
        };
    }
    async submitRating(callerId, listenerId, callId, rating, reviewText) {
        if (rating < 1 || rating > 5)
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        const review = this.ratingRepo.create({
            reviewerId: callerId,
            revieweeId: listenerId,
            callId,
            rating,
            reviewText,
        });
        await this.ratingRepo.save(review);
        const lp = await this.listenerRepo.findOne({ where: { userId: listenerId } });
        if (lp) {
            const currentTotal = Number(lp.avgRating) * lp.totalRatings;
            lp.totalRatings += 1;
            lp.avgRating = (currentTotal + rating) / lp.totalRatings;
            await this.listenerRepo.save(lp);
        }
        return review;
    }
    async updateProfile(userId, data) {
        const lp = await this.listenerRepo.findOne({ where: { userId } });
        if (!lp)
            throw new common_1.NotFoundException('Listener profile not found');
        Object.assign(lp, data);
        return this.listenerRepo.save(lp);
    }
    async toggleAvailability(userId, isAvailable) {
        await this.listenerRepo.update({ userId }, { isAvailable });
        return { isAvailable };
    }
    async getEarnings(userId) {
        const lp = await this.listenerRepo.findOne({ where: { userId } });
        if (!lp)
            throw new common_1.NotFoundException('Listener profile not found');
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        return {
            totalEarnings: lp.totalEarnings,
            totalCalls: lp.totalCalls,
            totalMinutes: lp.totalMinutes,
            avgRating: lp.avgRating,
            totalRatings: lp.totalRatings,
            currentBalance: wallet ? wallet.balance : 0,
        };
    }
};
exports.ListenersService = ListenersService;
exports.ListenersService = ListenersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(listener_profile_entity_1.ListenerProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(social_entity_1.Rating)),
    __param(3, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ListenersService);
//# sourceMappingURL=listeners.service.js.map