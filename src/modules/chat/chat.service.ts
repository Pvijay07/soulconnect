import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageType } from './entities/message.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Conversation)
        private readonly convRepo: Repository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,
    ) { }

    async findOrCreateConversation(p1Id: string, p2Id: string) {
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

    async saveMessage(convId: string, senderId: string, content: string, type: MessageType = MessageType.TEXT) {
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

    async getMessages(convId: string, page = 1, limit = 50) {
        return this.messageRepo.find({
            where: { conversationId: convId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async getConversations(userId: string) {
        return this.convRepo.find({
            where: [
                { participant1Id: userId },
                { participant2Id: userId },
            ],
            order: { lastMessageAt: 'DESC' },
        });
    }
}
