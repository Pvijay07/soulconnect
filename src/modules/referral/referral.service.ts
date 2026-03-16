import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionCategory } from '../wallet/entities/transaction.entity';

@Injectable()
export class ReferralService {
    constructor(
        @InjectRepository(Referral)
        private readonly referralRepo: Repository<Referral>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly walletService: WalletService,
    ) { }

    async generateReferralCode(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        if (!user.referralCode) {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            user.referralCode = code;
            await this.userRepo.save(user);
        }
        return user.referralCode;
    }

    async processReferral(referralCode: string, newUserId: string) {
        const referrer = await this.userRepo.findOne({ where: { referralCode } });
        if (!referrer) return;

        const referral = this.referralRepo.create({
            referrerId: referrer.id,
            referredId: newUserId,
            status: 'pending',
        });

        await this.referralRepo.save(referral);
    }

    async rewardReferrer(referredId: string) {
        const referral = await this.referralRepo.findOne({
            where: { referredId, status: 'pending' }
        });

        if (referral) {
            const reward = 50; // ₹50 bonus for first recharge
            await this.walletService.creditWallet(
                referral.referrerId,
                reward,
                TransactionCategory.BONUS,
                referral.id,
                'Referral bonus'
            );

            referral.status = 'rewarded';
            referral.rewardAmount = reward;
            await this.referralRepo.save(referral);
        }
    }
}
