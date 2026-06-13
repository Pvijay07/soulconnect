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

    async findOrCreateConversation(p1Id: string, p2Id: string, isSupport = false) {
        const sortedIds = [p1Id, p2Id].sort();
        let conv = await this.convRepo.findOne({
            where: { participant1Id: sortedIds[0], participant2Id: sortedIds[1] },
        });

        if (conv && isSupport && !conv.isSupport) {
            conv.isSupport = true;
            await this.convRepo.save(conv);
        }

        if (!conv) {
            // p1Id is the sender who initiated it. Let's see if sender is an expert.
            // Wait, we don't have the user roles here easily without querying.
            // Let's pass senderId explicitly.
            conv = this.convRepo.create({
                participant1Id: sortedIds[0],
                participant2Id: sortedIds[1],
                initiatedById: p1Id, // We assume p1Id is the initiator from the context of who calls it. Actually let's change signature if needed.
                status: 'pending',
                isSupport,
            });
            await this.convRepo.save(conv);
        }
        return conv;
    }

    async saveMessage(convId: string, senderId: string, content?: string, type: MessageType = MessageType.TEXT, mediaUrl?: string) {
        const message = this.messageRepo.create({
            conversationId: convId,
            senderId,
            content,
            messageType: type,
            mediaUrl,
        });
        await this.messageRepo.save(message);

        await this.convRepo.update(convId, {
            lastMessageId: message.id,
            lastMessageAt: new Date(),
        });

        const fullMessage = await this.messageRepo.findOne({
            where: { id: message.id },
            relations: ['sender', 'sender.profile', 'sender.listenerProfile'],
        });

        return fullMessage || message;
    }

    async updateConversationStatus(convId: string, status: string) {
        await this.convRepo.update(convId, { status });
    }

    async getMessages(convId: string, page = 1, limit = 50) {
        return this.messageRepo.find({
            where: { conversationId: convId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async getConversations(userId: string, isSupportOnly: boolean = false) {
        const whereClause: any[] = [
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
}
