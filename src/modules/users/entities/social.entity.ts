import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('ratings')
export class Rating {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    callId: string;

    @Column({ type: 'uuid' })
    reviewerId: string;

    @Column({ type: 'uuid' })
    revieweeId: string;

    @Column({ type: 'smallint' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    reviewText: string;

    @Column({ type: 'boolean', default: true })
    isVisible: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'reviewerId' })
    reviewer: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'revieweeId' })
    reviewee: User;
}

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    reporterId: string;

    @Column({ type: 'uuid' })
    reportedId: string;

    @Column({ type: 'varchar', length: 30 })
    reason: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'simple-array', nullable: true })
    evidenceUrls: string[];

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status: string;

    @Column({ type: 'text', nullable: true })
    adminNotes: string;

    @Column({ type: 'uuid', nullable: true })
    resolvedBy: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    resolvedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'reporterId' })
    reporter: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'reportedId' })
    reported: User;
}

@Entity('blocked_users')
export class BlockedUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    blockerId: string;

    @Column({ type: 'uuid' })
    blockedId: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'blockerId' })
    blocker: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'blockedId' })
    blocked: User;
}
