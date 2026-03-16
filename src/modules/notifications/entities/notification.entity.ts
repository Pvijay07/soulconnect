import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 200 })
    title: string;

    @Column({ type: 'text', nullable: true })
    body: string;

    @Column({ type: 'varchar', length: 30 })
    type: string;

    @Column({ type: 'jsonb', nullable: true })
    data: Record<string, any>;

    @Column({ type: 'boolean', default: false })
    isRead: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    sentAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    readAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;
}

@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 500 })
    deviceToken: string;

    @Column({ type: 'varchar', length: 10 })
    platform: string;

    @Column({ type: 'jsonb', nullable: true })
    deviceInfo: Record<string, any>;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;
}
