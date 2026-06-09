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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const profile_entity_1 = require("./entities/profile.entity");
const interest_entity_1 = require("./entities/interest.entity");
const social_entity_1 = require("./entities/social.entity");
let UsersService = class UsersService {
    userRepo;
    profileRepo;
    interestRepo;
    ratingRepo;
    reportRepo;
    blockedRepo;
    constructor(userRepo, profileRepo, interestRepo, ratingRepo, reportRepo, blockedRepo) {
        this.userRepo = userRepo;
        this.profileRepo = profileRepo;
        this.interestRepo = interestRepo;
        this.ratingRepo = ratingRepo;
        this.reportRepo = reportRepo;
        this.blockedRepo = blockedRepo;
    }
    async updateProfile(userId, data) {
        const profile = await this.profileRepo.findOne({ where: { userId } });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        Object.assign(profile, data);
        return this.profileRepo.save(profile);
    }
    async getPublicProfile(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['profile', 'listenerProfile'],
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            id: user.id,
            isAnonymous: user.isAnonymous,
            profile: {
                displayName: user.profile?.displayName,
                avatarUrl: user.profile?.avatarUrl,
                bio: user.profile?.bio,
                isOnline: user.profile?.isOnline,
            },
            listenerProfile: user.listenerProfile ? {
                headline: user.listenerProfile.headline,
                expertiseTags: user.listenerProfile.expertiseTags,
                voiceRatePerMin: user.listenerProfile.voiceRatePerMin,
                videoRatePerMin: user.listenerProfile.videoRatePerMin,
                avgRating: user.listenerProfile.avgRating,
                totalRatings: user.listenerProfile.totalRatings,
                isAvailable: user.listenerProfile.isAvailable,
            } : null,
        };
    }
    async getAllInterests() {
        return this.interestRepo.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }
    async rateUser(reviewerId, revieweeId, callId, rating, reviewText) {
        const ratingEntity = this.ratingRepo.create({
            callId, reviewerId, revieweeId, rating, reviewText,
        });
        return this.ratingRepo.save(ratingEntity);
    }
    async getUserRatings(userId, page = 1, limit = 20) {
        const [ratings, total] = await this.ratingRepo.findAndCount({
            where: { revieweeId: userId, isVisible: true },
            relations: ['reviewer'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { ratings, total, page, limit, hasNext: page * limit < total };
    }
    async reportUser(reporterId, reportedId, reason, description) {
        const report = this.reportRepo.create({
            reporterId, reportedId, reason, description,
        });
        return this.reportRepo.save(report);
    }
    async blockUser(blockerId, blockedId) {
        const existing = await this.blockedRepo.findOne({ where: { blockerId, blockedId } });
        if (existing)
            return existing;
        const block = this.blockedRepo.create({ blockerId, blockedId });
        return this.blockedRepo.save(block);
    }
    async unblockUser(blockerId, blockedId) {
        await this.blockedRepo.delete({ blockerId, blockedId });
        return { message: 'User unblocked' };
    }
    async getBlockedUsers(userId) {
        return this.blockedRepo.find({
            where: { blockerId: userId },
            relations: ['blocked'],
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(profile_entity_1.Profile)),
    __param(2, (0, typeorm_1.InjectRepository)(interest_entity_1.Interest)),
    __param(3, (0, typeorm_1.InjectRepository)(social_entity_1.Rating)),
    __param(4, (0, typeorm_1.InjectRepository)(social_entity_1.Report)),
    __param(5, (0, typeorm_1.InjectRepository)(social_entity_1.BlockedUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map