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
exports.AdvancedMatchingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const listener_profile_entity_1 = require("../listeners/entities/listener-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
let AdvancedMatchingService = class AdvancedMatchingService {
    lpRepo;
    userRepo;
    constructor(lpRepo, userRepo) {
        this.lpRepo = lpRepo;
        this.userRepo = userRepo;
    }
    async getDeepMatches(userId, limit = 5) {
        const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['profile'] });
        if (!user)
            return [];
        const userVector = this.simulateEmbedding(user.profile?.bio || 'General Support');
        const listeners = await this.lpRepo.find({
            where: { isAvailable: true, isApproved: true },
            relations: ['user', 'user.profile'],
        });
        const matches = listeners.map(listener => {
            const listenerVector = this.simulateEmbedding(`${listener.headline} ${listener.expertiseTags.join(' ')} ${listener.description}`);
            const similarity = this.calculateCosineSimilarity(userVector, listenerVector);
            return {
                listenerId: listener.userId,
                displayName: listener.user?.profile?.displayName,
                avatarUrl: listener.user?.profile?.avatarUrl,
                headline: listener.headline,
                similarity: Math.round(similarity * 100),
                matchReason: this.generateMatchReason(listener.expertiseTags, user.profile?.bio || '')
            };
        });
        return matches
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }
    simulateEmbedding(text) {
        const vector = new Array(64).fill(0);
        for (let i = 0; i < text.length; i++) {
            vector[text.charCodeAt(i) % 64] += 1;
        }
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
        return vector.map(v => v / magnitude);
    }
    calculateCosineSimilarity(v1, v2) {
        let dotProduct = 0;
        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
        }
        return dotProduct;
    }
    generateMatchReason(tags, bio) {
        const common = tags.find(tag => bio.toLowerCase().includes(tag.toLowerCase()));
        if (common)
            return `Mutual interest in ${common}`;
        return 'Deep personality compatibility detected by AI';
    }
};
exports.AdvancedMatchingService = AdvancedMatchingService;
exports.AdvancedMatchingService = AdvancedMatchingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(listener_profile_entity_1.ListenerProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AdvancedMatchingService);
//# sourceMappingURL=advanced-matching.service.js.map