import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
export declare class ReferralService {
    private readonly referralRepo;
    private readonly userRepo;
    private readonly walletService;
    constructor(referralRepo: Repository<Referral>, userRepo: Repository<User>, walletService: WalletService);
    generateReferralCode(userId: string): Promise<string>;
    processReferral(referralCode: string, newUserId: string): Promise<void>;
    rewardReferrer(referredId: string): Promise<void>;
}
