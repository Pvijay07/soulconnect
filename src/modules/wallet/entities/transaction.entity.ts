import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
    CREDIT = 'credit',
    DEBIT = 'debit',
}

export enum TransactionCategory {
    RECHARGE = 'recharge',
    CALL_DEBIT = 'call_debit',
    CALL_EARNING = 'call_earning',
    COMMISSION = 'commission',
    WITHDRAWAL = 'withdrawal',
    REFUND = 'refund',
    BONUS = 'bonus',
    GIFT = 'gift',
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    walletId: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'enum', enum: TransactionType })
    type: TransactionType;

    @Column({ type: 'enum', enum: TransactionCategory })
    category: TransactionCategory;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    balanceAfter: number;

    @Column({ type: 'varchar', length: 30, nullable: true })
    referenceType: string;

    @Column({ type: 'uuid', nullable: true })
    referenceId: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
    @JoinColumn({ name: 'walletId' })
    wallet: Wallet;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;
}
