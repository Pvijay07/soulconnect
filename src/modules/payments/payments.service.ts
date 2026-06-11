import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionCategory } from '../wallet/entities/transaction.entity';
import { CallsGateway } from '../calls/gateways/calls.gateway';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private razorpayInstance: any;

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        private readonly walletService: WalletService,
        private readonly callsGateway: CallsGateway,
        private readonly configService: ConfigService,
    ) {
        const key_id = this.configService.get<string>('PAYMENT_GATEWAY_KEY') || process.env.PAYMENT_GATEWAY_KEY;
        const key_secret = this.configService.get<string>('PAYMENT_GATEWAY_SECRET') || process.env.PAYMENT_GATEWAY_SECRET;
        
        this.logger.log(`Razorpay key_id: ${key_id ? key_id.substring(0, 12) + '...' : 'MISSING'}`);

        if (key_id && key_secret) {
            this.razorpayInstance = new Razorpay({ key_id, key_secret });
            this.logger.log('Razorpay SDK initialized successfully');
        } else {
            this.logger.warn('Razorpay keys not found! Payment orders will fail.');
        }
    }

    async createRechargeIntent(userId: string, amount: number, gateway: string) {
        if (amount <= 0) throw new BadRequestException('Invalid amount');

        // Create pending payment record in our DB
        const payment = this.paymentRepo.create({
            userId,
            amount,
            gateway,
            status: 'pending',
        });
        await this.paymentRepo.save(payment);

        // Create a REAL Razorpay order via their API
        if (!this.razorpayInstance) {
            throw new BadRequestException('Payment gateway not configured');
        }

        try {
            const razorpayOrder = await this.razorpayInstance.orders.create({
                amount: amount * 100, // Razorpay expects paise
                currency: 'INR',
                receipt: payment.id, // Our internal payment ID as receipt
                notes: {
                    userId,
                    paymentId: payment.id,
                },
            });

            this.logger.log(`Razorpay order created: ${razorpayOrder.id} for ₹${amount}`);

            // Save the Razorpay order ID on our payment record
            payment.gatewayTxnId = razorpayOrder.id;
            await this.paymentRepo.save(payment);

            return {
                id: razorpayOrder.id,       // Real Razorpay order_id
                paymentId: payment.id,       // Our internal payment UUID
                amount: razorpayOrder.amount,
                amount_inr: amount,
                currency: 'INR',
                status: 'created',
                gateway,
            };
        } catch (error) {
            this.logger.error(`Razorpay order creation failed: ${error.message}`, error.stack);
            // Mark payment as failed
            payment.status = 'failed';
            await this.paymentRepo.save(payment);
            throw new BadRequestException(`Payment gateway error: ${error.message}`);
        }
    }

    // Simplified mock verification for MVP development
    async verifyMockPayment(userId: string, paymentId: string) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId, userId } });
        if (!payment) throw new BadRequestException('Payment not found');
        if (payment.status !== 'pending') return payment;

        payment.status = 'completed';
        payment.gatewayTxnId = payment.gatewayTxnId || `txn_${Math.random().toString(36).substr(2, 9)}`;
        await this.paymentRepo.save(payment);

        // Credit the wallet
        const wallet = await this.walletService.creditWallet(
            userId,
            Number(payment.amount),
            TransactionCategory.RECHARGE,
            payment.id,
            `Recharge via ${payment.gateway}`,
        );

        // Emit wallet update to user's socket rooms (calls namespace)
        try {
            this.callsGateway.server.to(`user_${userId}`).emit('wallet:update', { balance: Number(wallet.balance) });
        } catch (e) {
            // ignore if socket not available
        }

        return payment;
    }
}
