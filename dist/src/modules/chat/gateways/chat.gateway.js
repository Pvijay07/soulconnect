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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const chat_service_1 = require("../chat.service");
const moderation_service_1 = require("../../moderation/moderation.service");
let ChatGateway = class ChatGateway {
    jwtService;
    configService;
    chatService;
    moderationService;
    server;
    connectedUsers = new Map();
    constructor(jwtService, configService, chatService, moderationService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.chatService = chatService;
        this.moderationService = moderationService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret'),
            });
            const userId = payload.sub;
            client.data.userId = userId;
            this.connectedUsers.set(userId, client.id);
            console.log(`User connected: ${userId}`);
            client.join(`user_${userId}`);
        }
        catch (e) {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            this.connectedUsers.delete(userId);
            console.log(`User disconnected: ${userId}`);
        }
    }
    async handleMessage(client, data) {
        const senderId = client.data.userId;
        const { recipientId, content, type } = data;
        const modResult = await this.moderationService.checkContent(content);
        if (modResult.isFlagged) {
            await this.moderationService.flagUserForReview(senderId, 'TOXIC_CONTENT', content);
            return { status: 'error', reason: 'Content flagged by AI moderation' };
        }
        const conv = await this.chatService.findOrCreateConversation(senderId, recipientId);
        const message = await this.chatService.saveMessage(conv.id, senderId, content, type);
        this.server.to(`user_${senderId}`).emit('message:new', message);
        this.server.to(`user_${recipientId}`).emit('message:new', message);
        return { status: 'ok', messageId: message.id };
    }
    handleTyping(client, data) {
        const senderId = client.data.userId;
        this.server.to(`user_${data.recipientId}`).emit('typing:update', {
            senderId,
            isTyping: data.isTyping,
        });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:status'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: 'chat',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        chat_service_1.ChatService,
        moderation_service_1.ModerationService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map