import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../../users/entities/user.entity';

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    VOICE_NOTE = 'voice_note',
    SYSTEM = 'system',
}

export enum MessageStatus {
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
}

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    conversationId: string;

    @Column({ type: 'uuid' })
    senderId: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
    messageType: MessageType;

    @Column({ type: 'varchar', length: 500, nullable: true })
    mediaUrl: string;

    @Column({ type: 'jsonb', nullable: true })
    mediaMetadata: Record<string, any>;

    @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.SENT })
    status: MessageStatus;

    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    expiresAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => Conversation)
    @JoinColumn({ name: 'conversationId' })
    conversation: Conversation;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'senderId' })
    sender: User;
}
