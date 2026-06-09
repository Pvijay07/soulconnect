import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    VOICE_NOTE = "voice_note",
    SYSTEM = "system"
}
export declare enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read"
}
export declare class Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    messageType: MessageType;
    mediaUrl: string;
    mediaMetadata: Record<string, any>;
    status: MessageStatus;
    isDeleted: boolean;
    expiresAt: Date;
    createdAt: Date;
    conversation: Conversation;
    sender: User;
}
