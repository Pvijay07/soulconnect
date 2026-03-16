import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType, TransactionCategory } from './entities/transaction.entity';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet)
        private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
        private readonly dataSource: DataSource,
    ) { }

    async getWallet(userId: string) {
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) throw new NotFoundException('Wallet not found');
        return wallet;
    }

    async getTransactions(userId: string, page = 1, limit = 20) {
        const [transactions, total] = await this.transactionRepo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { transactions, total, page, limit, hasNext: page * limit < total };
    }

    async creditWallet(userId: string, amount: number, category: TransactionCategory, referenceId?: string, description?: string) {
        return await this.dataSource.transaction(async (manager) => {
            const wallet = await manager.findOne(Wallet, { where: { userId }, lock: { mode: 'pessimistic_write' } });
            if (!wallet) throw new NotFoundException('Wallet not found');

            const balanceBefore = Number(wallet.balance);
            wallet.balance = balanceBefore + amount;
            await manager.save(wallet);

            const transaction = manager.create(Transaction, {
                walletId: wallet.id,
                userId,
                type: TransactionType.CREDIT,
                category,
                amount,
                balanceAfter: wallet.balance,
                referenceId,
                description,
            });
            await manager.save(transaction);

            return wallet;
        });
    }

    async debitWallet(userId: string, amount: number, category: TransactionCategory, referenceId?: string, description?: string) {
        return await this.dataSource.transaction(async (manager) => {
            const wallet = await manager.findOne(Wallet, { where: { userId }, lock: { mode: 'pessimistic_write' } });
            if (!wallet) throw new NotFoundException('Wallet not found');

            const balanceBefore = Number(wallet.balance);
            if (balanceBefore < amount) throw new BadRequestException('Insufficient balance');

            wallet.balance = balanceBefore - amount;
            await manager.save(wallet);

            const transaction = manager.create(Transaction, {
                walletId: wallet.id,
                userId,
                type: TransactionType.DEBIT,
                category,
                amount,
                balanceAfter: wallet.balance,
                referenceId,
                description,
            });
            await manager.save(transaction);

            return wallet;
        });
    }
}
