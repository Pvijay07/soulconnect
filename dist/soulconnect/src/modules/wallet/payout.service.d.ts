import { Repository, DataSource } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
export declare class PayoutService {
    private readonly payoutRepo;
    private readonly walletRepo;
    private readonly walletService;
    private readonly dataSource;
    constructor(payoutRepo: Repository<Payout>, walletRepo: Repository<Wallet>, walletService: WalletService, dataSource: DataSource);
    requestPayout(userId: string, amount: number, bankDetails: any): Promise<Payout>;
    getPayoutsForListener(userId: string): Promise<Payout[]>;
    getAllPayouts(status?: string): Promise<Payout[]>;
    updatePayoutStatus(payoutId: string, status: 'processing' | 'completed' | 'failed', remarks?: string, reference?: string): Promise<Payout>;
}
