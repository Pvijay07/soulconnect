import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('conversations')
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    participant1Id: string;

    @Column({ type: 'uuid' })
    participant2Id: string;

    @Column({ type: 'uuid', nullable: true })
    lastMessageId: string;

    @Column({ type: 'timestamptz', nullable: true })
    lastMessageAt: Date;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'participant1Id' })
    participant1: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'participant2Id' })
    participant2: User;
}
