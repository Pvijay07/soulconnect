import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, OneToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';

@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', unique: true })
    userId: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    balance: number;

    @Column({ type: 'varchar', length: 3, default: 'INR' })
    currency: string;

    @Column({ type: 'boolean', default: false })
    isFrozen: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(() => Transaction, (txn) => txn.wallet)
    transactions: Transaction[];
}
