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
const wallet_service_1 = require("../../wallet/wallet.service");
const transaction_entity_1 = require("../../wallet/entities/transaction.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let ChatGateway = class ChatGateway {
    jwtService;
    configService;
    chatService;
    moderationService;
    walletService;
    userRepo;
    server;
    connectedUsers = new Map();
    constructor(jwtService, configService, chatService, moderationService, walletService, userRepo) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.chatService = chatService;
        this.moderationService = moderationService;
        this.walletService = walletService;
        this.userRepo = userRepo;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret'),
            });
            const userId = payload.sub;
            client.data.userId = userId;
            client.data.role = payload.role;
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
        const senderRole = client.data.role;
        const { recipientId, content, type, mediaUrl } = data;
        if (content) {
            const modResult = await this.moderationService.checkContent(content);
            if (modResult.isFlagged) {
                await this.moderationService.flagUserForReview(senderId, 'TOXIC_CONTENT', content);
                return { status: 'error', reason: 'Content flagged by AI moderation' };
            }
        }
        const conv = await this.chatService.findOrCreateConversation(senderId, recipientId);
        if (senderRole === 'user') {
            const recipient = await this.userRepo.findOne({ where: { id: recipientId } });
            if (recipient && recipient.role !== user_entity_1.UserRole.ADMIN) {
                try {
                    await this.walletService.debitWallet(senderId, 3, transaction_entity_1.TransactionCategory.CHAT_DEBIT, conv.id, 'Chat message cost');
                    await this.walletService.creditWallet(recipientId, 3, transaction_entity_1.TransactionCategory.CHAT_EARNING, conv.id, 'Chat message earning');
                }
                catch (e) {
                    return { status: 'error', reason: 'Insufficient balance. Please recharge your wallet.' };
                }
            }
        }
        const message = await this.chatService.saveMessage(conv.id, senderId, content, type, mediaUrl);
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
    async handleMessageRead(client, data) {
        const readerId = client.data.userId;
        const { messageId, senderId } = data;
        await this.chatService.markMessageAsRead(messageId);
        this.server.to(`user_${senderId}`).emit('message:read_update', {
            messageId,
            readerId,
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
__decorate([
    (0, websockets_1.SubscribeMessage)('message:read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessageRead", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: 'chat',
    }),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        chat_service_1.ChatService,
        moderation_service_1.ModerationService,
        wallet_service_1.WalletService,
        typeorm_2.Repository])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map