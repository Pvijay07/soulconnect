import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('referrals')
export class Referral {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'referrerId' })
    referrer: User;

    @Column()
    referrerId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'referredId' })
    referred: User;

    @Column()
    referredId: string;

    @Column({ default: 'pending' })
    status: 'pending' | 'completed' | 'rewarded'; // completed = signup, rewarded = first recharge

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    rewardAmount: number;

    @CreateDateColumn()
    createdAt: Date;
}
