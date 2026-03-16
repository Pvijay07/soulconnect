import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('payouts')
export class Payout {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'listenerId' })
    listener: User;

    @Column()
    listenerId: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ default: 'INR' })
    currency: string;

    @Column({ type: 'jsonb', nullable: true })
    bankDetails: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
        bankName: string;
    };

    @Column({ default: 'pending' })
    status: 'pending' | 'processing' | 'completed' | 'failed';

    @Column({ nullable: true })
    transactionReference: string;

    @Column({ nullable: true })
    remarks: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
