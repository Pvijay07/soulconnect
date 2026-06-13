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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
const chat_service_1 = require("./chat.service");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getConversations(req, isSupport) {
        const userId = req.user.userId;
        const convs = await this.chatService.getConversations(userId, isSupport === 'true');
        return {
            status: 'success',
            data: convs,
        };
    }
    async getOrCreateConversation(req, recipientId, isSupport) {
        const userId = req.user.userId;
        const conv = await this.chatService.findOrCreateConversation(userId, recipientId, isSupport);
        return {
            status: 'success',
            data: conv,
        };
    }
    async getMessages(req, convId) {
        const messages = await this.chatService.getMessages(convId);
        return {
            status: 'success',
            data: messages,
        };
    }
    async updateStatus(req, convId, status) {
        await this.chatService.updateConversationStatus(convId, status);
        return {
            status: 'success',
            message: 'Conversation status updated'
        };
    }
    async closeConversation(req, convId) {
        await this.chatService.closeConversation(convId);
        return {
            status: 'success',
            message: 'Conversation closed'
        };
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('isSupport')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('recipientId')),
    __param(2, (0, common_1.Body)('isSupport')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getOrCreateConversation", null);
__decorate([
    (0, common_1.Get)('conversations/:convId/messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('convId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Patch)('conversations/:convId/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('convId')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('conversations/:convId/close'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('convId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "closeConversation", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map