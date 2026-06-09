import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';
export declare class Wallet {
    id: string;
    userId: string;
    balance: number;
    currency: string;
    isFrozen: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    transactions: Transaction[];
}
