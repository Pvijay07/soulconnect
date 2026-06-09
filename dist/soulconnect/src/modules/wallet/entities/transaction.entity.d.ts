import { Wallet } from './wallet.entity';
import { User } from '../../users/entities/user.entity';
export declare enum TransactionType {
    CREDIT = "credit",
    DEBIT = "debit"
}
export declare enum TransactionCategory {
    RECHARGE = "recharge",
    CALL_DEBIT = "call_debit",
    CALL_EARNING = "call_earning",
    COMMISSION = "commission",
    WITHDRAWAL = "withdrawal",
    REFUND = "refund",
    BONUS = "bonus",
    GIFT = "gift"
}
export declare class Transaction {
    id: string;
    walletId: string;
    userId: string;
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    balanceAfter: number;
    referenceType: string;
    referenceId: string;
    description: string;
    metadata: Record<string, any>;
    createdAt: Date;
    wallet: Wallet;
    user: User;
}
