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
var ModerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const social_entity_1 = require("../users/entities/social.entity");
let ModerationService = ModerationService_1 = class ModerationService {
    configService;
    reportRepo;
    logger = new common_1.Logger(ModerationService_1.name);
    constructor(configService, reportRepo) {
        this.configService = configService;
        this.reportRepo = reportRepo;
    }
    async checkContent(content) {
        const bannedKeywords = ['spam', 'buy bitcoin', 'offensive_word1', 'offensive_word2'];
        const lowerContent = content.toLowerCase();
        const flaggedTags = bannedKeywords.filter(keyword => lowerContent.includes(keyword));
        if (flaggedTags.length > 0) {
            return {
                isFlagged: true,
                score: 0.9,
                tags: ['TOXICITY', 'SPAM'],
            };
        }
        return {
            isFlagged: false,
            score: 0.1,
            tags: [],
        };
    }
    async flagUserForReview(userId, reason, evidence) {
        this.logger.warn(`AI FLAG: User ${userId} flagged for ${reason}`);
        const report = this.reportRepo.create({
            reportedId: userId,
            reporterId: '00000000-0000-0000-0000-000000000000',
            reason: 'AI_MODERATION',
            description: `Automatically flagged: ${reason}. Evidence: ${evidence}`,
            status: 'pending',
        });
        await this.reportRepo.save(report);
    }
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = ModerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(social_entity_1.Report)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], ModerationService);
//# sourceMappingURL=moderation.service.js.map