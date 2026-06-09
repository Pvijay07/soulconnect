import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { WalletService } from '../wallet/wallet.service';
import { CallsGateway } from '../calls/gateways/calls.gateway';
export declare class PaymentsService {
    private readonly paymentRepo;
    private readonly walletService;
    private readonly callsGateway;
    constructor(paymentRepo: Repository<Payment>, walletService: WalletService, callsGateway: CallsGateway);
    createRechargeIntent(userId: string, amount: number, gateway: string): Promise<{
        id: string;
        paymentId: string;
        amount: number;
        amount_inr: number;
        currency: string;
        status: string;
        gateway: string;
    }>;
    verifyMockPayment(userId: string, paymentId: string): Promise<Payment>;
}
