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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
let ChatService = class ChatService {
    convRepo;
    messageRepo;
    constructor(convRepo, messageRepo) {
        this.convRepo = convRepo;
        this.messageRepo = messageRepo;
    }
    async findOrCreateConversation(p1Id, p2Id, isSupport = false) {
        const sortedIds = [p1Id, p2Id].sort();
        let conv = await this.convRepo.findOne({
            where: { participant1Id: sortedIds[0], participant2Id: sortedIds[1] },
        });
        if (conv && isSupport && !conv.isSupport) {
            conv.isSupport = true;
            await this.convRepo.save(conv);
        }
        if (!conv) {
            conv = this.convRepo.create({
                participant1Id: sortedIds[0],
                participant2Id: sortedIds[1],
                initiatedById: p1Id,
                status: 'pending',
                isSupport,
            });
            await this.convRepo.save(conv);
        }
        return conv;
    }
    async saveMessage(conversationId, senderId, content, type, mediaUrl) {
        const msg = this.messageRepo.create({
            conversationId,
            senderId,
            content,
            messageType: type || message_entity_1.MessageType.TEXT,
            mediaUrl,
        });
        const savedMsg = await this.messageRepo.save(msg);
        await this.convRepo.update(conversationId, {
            lastMessageAt: savedMsg.createdAt,
            lastMessageId: savedMsg.id,
        });
        const fullMessage = await this.messageRepo.findOne({
            where: { id: savedMsg.id },
            relations: ['sender', 'sender.profile', 'sender.listenerProfile'],
        });
        return fullMessage || savedMsg;
    }
    async markMessageAsRead(messageId) {
        await this.messageRepo.update(messageId, { status: message_entity_1.MessageStatus.READ });
    }
    async updateConversationStatus(convId, status) {
        await this.convRepo.update(convId, { status });
    }
    async closeConversation(convId) {
        await this.convRepo.update(convId, { isActive: false, status: 'closed' });
    }
    async getMessages(convId, page = 1, limit = 50) {
        return this.messageRepo.find({
            where: { conversationId: convId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    async getConversations(userId, isSupportOnly = false) {
        const whereClause = [
            { participant1Id: userId },
            { participant2Id: userId },
        ];
        if (isSupportOnly) {
            whereClause[0].isSupport = true;
            whereClause[1].isSupport = true;
        }
        return this.convRepo.find({
            where: whereClause,
            relations: ['participant1', 'participant1.profile', 'participant1.listenerProfile', 'participant2', 'participant2.profile', 'participant2.listenerProfile'],
            order: { lastMessageAt: 'DESC' },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map