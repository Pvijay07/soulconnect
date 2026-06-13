import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageType } from './entities/message.entity';
export declare class ChatService {
    private readonly convRepo;
    private readonly messageRepo;
    constructor(convRepo: Repository<Conversation>, messageRepo: Repository<Message>);
    findOrCreateConversation(p1Id: string, p2Id: string, isSupport?: boolean): Promise<Conversation>;
    saveMessage(conversationId: string, senderId: string, content?: string, type?: MessageType, mediaUrl?: string): Promise<Message>;
    markMessageAsRead(messageId: string): Promise<void>;
    updateConversationStatus(convId: string, status: string): Promise<void>;
    closeConversation(convId: string): Promise<void>;
    getMessages(convId: string, page?: number, limit?: number): Promise<Message[]>;
    getConversations(userId: string, isSupportOnly?: boolean): Promise<Conversation[]>;
}
