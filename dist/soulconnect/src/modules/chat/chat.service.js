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
    async findOrCreateConversation(p1Id, p2Id) {
        const sortedIds = [p1Id, p2Id].sort();
        let conv = await this.convRepo.findOne({
            where: { participant1Id: sortedIds[0], participant2Id: sortedIds[1] },
        });
        if (!conv) {
            conv = this.convRepo.create({
                participant1Id: sortedIds[0],
                participant2Id: sortedIds[1],
            });
            await this.convRepo.save(conv);
        }
        return conv;
    }
    async saveMessage(convId, senderId, content, type = message_entity_1.MessageType.TEXT) {
        const message = this.messageRepo.create({
            conversationId: convId,
            senderId,
            content,
            messageType: type,
        });
        await this.messageRepo.save(message);
        await this.convRepo.update(convId, {
            lastMessageId: message.id,
            lastMessageAt: new Date(),
        });
        return message;
    }
    async getMessages(convId, page = 1, limit = 50) {
        return this.messageRepo.find({
            where: { conversationId: convId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    async getConversations(userId) {
        return this.convRepo.find({
            where: [
                { participant1Id: userId },
                { participant2Id: userId },
            ],
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