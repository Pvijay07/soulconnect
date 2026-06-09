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
exports.MatchingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const listener_profile_entity_1 = require("../listeners/entities/listener-profile.entity");
const interest_entity_1 = require("../users/entities/interest.entity");
let MatchingService = class MatchingService {
    userRepo;
    lpRepo;
    interestRepo;
    constructor(userRepo, lpRepo, interestRepo) {
        this.userRepo = userRepo;
        this.lpRepo = lpRepo;
        this.interestRepo = interestRepo;
    }
    async getTopMatches(userId, limit = 10) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const listeners = await this.lpRepo.find({
            where: {
                isAvailable: true,
                isApproved: true
            },
            relations: ['user', 'user.profile'],
        });
        const results = [];
        for (const listener of listeners) {
            const scoreData = this.calculateMatchScore(user, listener);
            results.push({
                listenerId: listener.userId,
                score: scoreData.score,
                reason: scoreData.reasons,
                displayName: listener.user?.profile?.displayName,
                avatarUrl: listener.user?.profile?.avatarUrl,
                headline: listener.headline,
                ratePerMin: Number(listener.voiceRatePerMin),
            });
        }
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    calculateMatchScore(user, listener) {
        let score = 0;
        const reasons = [];
        const ratingWeight = 30;
        const ratingScore = (Number(listener.avgRating) / 5) * ratingWeight;
        score += ratingScore;
        if (Number(listener.avgRating) >= 4.5)
            reasons.push('Highly rated by peers');
        const experienceWeight = 20;
        if (listener.totalCalls > 100) {
            score += 20;
            reasons.push('Very experienced listener');
        }
        else if (listener.totalCalls > 20) {
            score += 10;
            reasons.push('Regularly active');
        }
        const userLangs = user.profile?.languages || ['en'];
        const listenerLangs = listener.languages || ['en'];
        const commonLangs = userLangs.filter(l => listenerLangs.includes(l));
        if (commonLangs.length > 0) {
            score += 20;
            reasons.push(`Speaks your language (${commonLangs[0]})`);
        }
        if (listener.isVerified) {
            score += 10;
            reasons.push('Verified Trusted Listener');
        }
        const varietyBoost = Math.random() * 20;
        score += varietyBoost;
        return { score: Math.round(score), reasons };
    }
    async findByInterests(tags, limit = 10) {
        const qb = this.lpRepo.createQueryBuilder('lp')
            .leftJoinAndSelect('lp.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('lp.isAvailable = :available', { available: true })
            .andWhere('lp.isApproved = :approved', { approved: true });
        tags.forEach((tag, index) => {
            const paramName = `tag${index}`;
            qb.andWhere(`lp.expertiseTags LIKE :${paramName}`, { [paramName]: `%${tag}%` });
        });
        const listeners = await qb.orderBy('lp.avgRating', 'DESC').take(limit).getMany();
        return listeners.map(lp => ({
            id: lp.userId,
            displayName: lp.user?.profile?.displayName,
            expertise: lp.expertiseTags,
            rating: lp.avgRating,
            rate: lp.voiceRatePerMin,
        }));
    }
    async randomConnect(userId, preferredLanguage) {
        const now = new Date();
        let listeners = await this.lpRepo.find({ where: { isAvailable: true, isApproved: true }, relations: ['user'] });
        listeners = listeners.filter(l => Number(l.avgRating || 0) >= 3.0);
        if (listeners.length === 0)
            return null;
        const langMatched = preferredLanguage ? listeners.filter(l => (l.languages || []).includes(preferredLanguage)) : [];
        const pool = langMatched.length > 0 ? langMatched : listeners;
        const scoreOf = (l) => {
            const rating = (Number(l.avgRating) / 5) * 10;
            const availabilitySecs = Math.max(0, (now.getTime() - (l.updatedAt?.getTime() || now.getTime())) / 1000);
            const availability = Math.min(1, availabilitySecs / 3600);
            const responseRate = Math.min(1, (Number(l.totalCalls) / (Number(l.totalCalls) + 50)));
            const distribution = 1 / (1 + Number(l.totalCalls) / 10);
            return rating * 0.4 + availability * 10 * 0.2 + responseRate * 10 * 0.2 + distribution * 10 * 0.2;
        };
        pool.sort((a, b) => scoreOf(b) - scoreOf(a));
        const top = pool.slice(0, 3);
        const chosen = top.length === 1 ? top[0] : top[Math.floor(Math.random() * top.length)];
        if (!chosen)
            return null;
        chosen.isAvailable = false;
        chosen.status = 'busy';
        await this.lpRepo.save(chosen);
        return {
            listenerId: chosen.userId,
            displayName: chosen.user?.profile?.displayName,
            avatarUrl: chosen.user?.profile?.avatarUrl,
            headline: chosen.headline,
            ratePerMin: Number(chosen.voiceRatePerMin),
        };
    }
};
exports.MatchingService = MatchingService;
exports.MatchingService = MatchingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(listener_profile_entity_1.ListenerProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(interest_entity_1.Interest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MatchingService);
//# sourceMappingURL=matching.service.js.map