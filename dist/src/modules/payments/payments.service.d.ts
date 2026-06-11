import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { WalletService } from '../wallet/wallet.service';
import { CallsGateway } from '../calls/gateways/calls.gateway';
export declare class PaymentsService {
    private readonly paymentRepo;
    private readonly walletService;
    private readonly callsGateway;
    private readonly configService;
    private readonly logger;
    private razorpayInstance;
    constructor(paymentRepo: Repository<Payment>, walletService: WalletService, callsGateway: CallsGateway, configService: ConfigService);
    createRechargeIntent(userId: string, amount: number, gateway: string): Promise<{
        id: any;
        paymentId: string;
        amount: any;
        amount_inr: number;
        currency: string;
        status: string;
        gateway: string;
    }>;
    verifyMockPayment(userId: string, paymentId: string): Promise<Payment>;
}
