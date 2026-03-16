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
exports.ListenersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
const listeners_service_1 = require("./listeners.service");
let ListenersController = class ListenersController {
    listenersService;
    constructor(listenersService) {
        this.listenersService = listenersService;
    }
    async apply(req, dto) {
        return { data: await this.listenersService.apply(req.user.sub, dto) };
    }
    async browse(category, language, minRating, maxRate, sort, page, limit) {
        return { data: await this.listenersService.browse({ category, language, minRating, maxRate, sort, page, limit }) };
    }
    async getEarnings(req) {
        return { data: await this.listenersService.getEarnings(req.user.sub) };
    }
    async toggleAvailability(req, isAvailable) {
        return { data: await this.listenersService.toggleAvailability(req.user.sub, isAvailable) };
    }
    async updateProfile(req, dto) {
        return { data: await this.listenersService.updateProfile(req.user.sub, dto) };
    }
    async getDetail(id) {
        return { data: await this.listenersService.getDetail(id) };
    }
    async submitRating(req, id, dto) {
        return { data: await this.listenersService.submitRating(req.user.sub, id, dto.callId, dto.rating, dto.reviewText) };
    }
    async getPending(page, limit) {
        return { data: await this.listenersService.getAdminPending(page, limit) };
    }
    async approve(id) {
        return { data: await this.listenersService.approveListener(id) };
    }
    async reject(id, reason) {
        return { data: await this.listenersService.rejectListener(id, reason) };
    }
};
exports.ListenersController = ListenersController;
__decorate([
    (0, common_1.Post)('apply'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Apply to become a listener' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ListenersController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Browse available listeners' }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('language')),
    __param(2, (0, common_1.Query)('min_rating')),
    __param(3, (0, common_1.Query)('max_rate')),
    __param(4, (0, common_1.Query)('sort')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ListenersController.prototype, "browse", null);
__decorate([
    (0, common_1.Get)('me/earnings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get listener earnings dashboard' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ListenersController.prototype, "getEarnings", null);
__decorate([
    (0, common_1.Put)('me/availability'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle availability' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('isAvailable')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], ListenersController.prototype, "toggleAvailability", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update listener profile' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ListenersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get listener detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListenersController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Post)(':id/rate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit rating for a listener' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ListenersController.prototype, "submitRating", null);
__decorate([
    (0, common_1.Get)('admin/pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ListenersController.prototype, "getPending", null);
__decorate([
    (0, common_1.Post)('admin/:id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListenersController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('admin/:id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListenersController.prototype, "reject", null);
exports.ListenersController = ListenersController = __decorate([
    (0, swagger_1.ApiTags)('Listeners'),
    (0, common_1.Controller)('listeners'),
    __metadata("design:paramtypes", [listeners_service_1.ListenersService])
], ListenersController);
//# sourceMappingURL=listeners.controller.js.map