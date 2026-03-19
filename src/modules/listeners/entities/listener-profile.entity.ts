import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('listener_profiles')
export class ListenerProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    headline: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'simple-array', default: '' })
    expertiseTags: string[];

    @Column({ type: 'simple-array', default: 'en' })
    languages: string[];

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    voiceRatePerMin: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    videoRatePerMin: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    chatRatePerMin: number;

    @Column({ type: 'boolean', default: false })
    isAvailable: boolean;

    @Column({ type: 'varchar', length: 20, default: 'offline' })
    status: string; // 'online', 'busy', 'offline'

    @Column({ type: 'boolean', default: false })
    isVerified: boolean;

    @Column({ type: 'boolean', default: false })
    isApproved: boolean;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    approvalStatus: string;

    @Column({ type: 'int', default: 0 })
    totalCalls: number;

    @Column({ type: 'int', default: 0 })
    totalMinutes: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    avgRating: number;

    @Column({ type: 'int', default: 0 })
    totalRatings: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalEarnings: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @Column({ type: 'varchar', length: 500, nullable: true })
    identityDocUrl: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    certificateUrl: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    introVideoUrl: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    rejectionReason: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    gender: string;

    @Column({ type: 'int', nullable: true })
    age: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    uploadedAvatarUrl: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToOne(() => User, (user) => user.listenerProfile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
