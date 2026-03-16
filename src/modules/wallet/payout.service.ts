import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { TransactionCategory } from './entities/transaction.entity';

@Injectable()
export class PayoutService {
    constructor(
        @InjectRepository(Payout)
        private readonly payoutRepo: Repository<Payout>,
        @InjectRepository(Wallet)
        private readonly walletRepo: Repository<Wallet>,
        private readonly walletService: WalletService,
        private readonly dataSource: DataSource,
    ) { }

    async requestPayout(userId: string, amount: number, bankDetails: any) {
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet || Number(wallet.balance) < amount) {
            throw new BadRequestException('Insufficient balance for payout');
        }

        if (amount < 500) {
            throw new BadRequestException('Minimum payout amount is ₹500');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Create payout record
            const payout = this.payoutRepo.create({
                listenerId: userId,
                amount,
                bankDetails,
                status: 'pending',
            });
            await queryRunner.manager.save(payout);

            // 2. Deduct from wallet
            await this.walletService.debitWallet(
                userId,
                amount,
                TransactionCategory.WITHDRAWAL,
                payout.id,
                'Payout request initiated'
            );

            await queryRunner.commitTransaction();
            return payout;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getPayoutsForListener(userId: string) {
        return this.payoutRepo.find({
            where: { listenerId: userId },
            order: { createdAt: 'DESC' },
        });
    }

    async getAllPayouts(status?: string) {
        const where = status ? { status: status as any } : {};
        return this.payoutRepo.find({
            where,
            relations: ['listener', 'listener.profile'],
            order: { createdAt: 'DESC' },
        });
    }

    async updatePayoutStatus(payoutId: string, status: 'processing' | 'completed' | 'failed', remarks?: string, reference?: string) {
        const payout = await this.payoutRepo.findOne({ where: { id: payoutId } });
        if (!payout) throw new NotFoundException('Payout request not found');

        payout.status = status;
        payout.remarks = remarks || payout.remarks;
        payout.transactionReference = reference || payout.transactionReference;

        if (status === 'failed') {
            // Refund the credits to the wallet
            await this.walletService.creditWallet(
                payout.listenerId,
                Number(payout.amount),
                TransactionCategory.REFUND,
                payout.id,
                'Payout refund due to failure'
            );
        }

        return await this.payoutRepo.save(payout);
    }
}
