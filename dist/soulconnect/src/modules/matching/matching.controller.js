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
exports.MatchingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
const matching_service_1 = require("./matching.service");
let MatchingController = class MatchingController {
    matchingService;
    constructor(matchingService) {
        this.matchingService = matchingService;
    }
    async getRecommendations(req, limit = 10) {
        const results = await this.matchingService.getTopMatches(req.user.sub, +limit);
        return { data: results };
    }
    async searchByTags(tags, limit = 10) {
        const tagList = tags.split(',').map(t => t.trim());
        const results = await this.matchingService.findByInterests(tagList, +limit);
        return { data: results };
    }
    async randomConnect(req, language) {
        const result = await this.matchingService.randomConnect(req.user.sub, language);
        if (!result)
            return { data: null, message: 'No experts available right now. Please try again in a moment.' };
        return { data: result };
    }
};
exports.MatchingController = MatchingController;
__decorate([
    (0, common_1.Get)('recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top matched listeners for the current user' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('search-by-tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Search for listeners by specific expertise tags' }),
    __param(0, (0, common_1.Query)('tags')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "searchByTags", null);
__decorate([
    (0, common_1.Get)('random-connect'),
    (0, swagger_1.ApiOperation)({ summary: 'Randomly connect to an available listener (instant connect)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "randomConnect", null);
exports.MatchingController = MatchingController = __decorate([
    (0, swagger_1.ApiTags)('Matching'),
    (0, common_1.Controller)('matching'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [matching_service_1.MatchingService])
], MatchingController);
//# sourceMappingURL=matching.controller.js.map