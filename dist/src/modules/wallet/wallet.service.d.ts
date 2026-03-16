import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionCategory } from './entities/transaction.entity';
export declare class WalletService {
    private readonly walletRepo;
    private readonly transactionRepo;
    private readonly dataSource;
    constructor(walletRepo: Repository<Wallet>, transactionRepo: Repository<Transaction>, dataSource: DataSource);
    getWallet(userId: string): Promise<Wallet>;
    getTransactions(userId: string, page?: number, limit?: number): Promise<{
        transactions: Transaction[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
    }>;
    creditWallet(userId: string, amount: number, category: TransactionCategory, referenceId?: string, description?: string): Promise<Wallet>;
    debitWallet(userId: string, amount: number, category: TransactionCategory, referenceId?: string, description?: string): Promise<Wallet>;
}
