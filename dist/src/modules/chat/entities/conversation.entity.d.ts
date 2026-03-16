import { User } from '../../users/entities/user.entity';
export declare class Conversation {
    id: string;
    participant1Id: string;
    participant2Id: string;
    lastMessageId: string;
    lastMessageAt: Date;
    isActive: boolean;
    createdAt: Date;
    participant1: User;
    participant2: User;
}
