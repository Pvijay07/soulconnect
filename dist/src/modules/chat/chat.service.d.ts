import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageType } from './entities/message.entity';
export declare class ChatService {
    private readonly convRepo;
    private readonly messageRepo;
    constructor(convRepo: Repository<Conversation>, messageRepo: Repository<Message>);
    findOrCreateConversation(p1Id: string, p2Id: string): Promise<Conversation>;
    saveMessage(convId: string, senderId: string, content: string, type?: MessageType): Promise<Message>;
    getMessages(convId: string, page?: number, limit?: number): Promise<Message[]>;
    getConversations(userId: string): Promise<Conversation[]>;
}
