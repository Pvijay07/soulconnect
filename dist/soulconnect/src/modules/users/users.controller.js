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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async updateProfile(req, dto) {
        return { data: await this.usersService.updateProfile(req.user.sub, dto) };
    }
    async getPublicProfile(id) {
        return { data: await this.usersService.getPublicProfile(id) };
    }
    async getInterests() {
        return { data: await this.usersService.getAllInterests() };
    }
    async getRatings(id, page = 1, limit = 20) {
        return { data: await this.usersService.getUserRatings(id, +page, +limit) };
    }
    async rateUser(req, id, dto) {
        return { data: await this.usersService.rateUser(req.user.sub, id, dto.callId, dto.rating, dto.reviewText) };
    }
    async reportUser(req, id, dto) {
        return { data: await this.usersService.reportUser(req.user.sub, id, dto.reason, dto.description) };
    }
    async blockUser(req, id) {
        return { data: await this.usersService.blockUser(req.user.sub, id) };
    }
    async unblockUser(req, id) {
        return { data: await this.usersService.unblockUser(req.user.sub, id) };
    }
    async getBlockedUsers(req) {
        return { data: await this.usersService.getBlockedUsers(req.user.sub) };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Put)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)(':id/public'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public profile' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPublicProfile", null);
__decorate([
    (0, common_1.Get)('interests'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all interests' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getInterests", null);
__decorate([
    (0, common_1.Get)(':id/ratings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user ratings' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getRatings", null);
__decorate([
    (0, common_1.Post)(':id/rate'),
    (0, swagger_1.ApiOperation)({ summary: 'Rate a user after call' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "rateUser", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    (0, swagger_1.ApiOperation)({ summary: 'Report a user' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "reportUser", null);
__decorate([
    (0, common_1.Post)(':id/block'),
    (0, swagger_1.ApiOperation)({ summary: 'Block a user' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Delete)(':id/block'),
    (0, swagger_1.ApiOperation)({ summary: 'Unblock a user' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "unblockUser", null);
__decorate([
    (0, common_1.Get)('blocked'),
    (0, swagger_1.ApiOperation)({ summary: 'Get blocked users list' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getBlockedUsers", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map