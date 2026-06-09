import { WalletService } from './wallet.service';
import { PayoutService } from './payout.service';
export declare class WalletController {
    private readonly walletService;
    private readonly payoutService;
    constructor(walletService: WalletService, payoutService: PayoutService);
    getWallet(req: any): Promise<{
        data: import("./entities/wallet.entity").Wallet;
    }>;
    getTransactions(req: any, page?: number, limit?: number): Promise<{
        data: {
            transactions: import("./entities/transaction.entity").Transaction[];
            total: number;
            page: number;
            limit: number;
            hasNext: boolean;
        };
    }>;
    recharge(req: any, amount: number): Promise<{
        data: import("./entities/wallet.entity").Wallet;
    }>;
    requestPayout(req: any, dto: {
        amount: number;
        bankDetails: any;
    }): Promise<{
        data: import("./entities/payout.entity").Payout;
    }>;
    getPayouts(req: any): Promise<{
        data: import("./entities/payout.entity").Payout[];
    }>;
}
