import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionCategory } from '../wallet/entities/transaction.entity';
import { CallsGateway } from '../calls/gateways/calls.gateway';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        private readonly walletService: WalletService,
        private readonly callsGateway: CallsGateway,
    ) { }

    async createRechargeIntent(userId: string, amount: number, gateway: string) {
        if (amount <= 0) throw new BadRequestException('Invalid amount');

        // Create pending payment record
        const payment = this.paymentRepo.create({
            userId,
            amount,
            gateway,
            status: 'pending',
        });
        await this.paymentRepo.save(payment);

        // In a real app, you'd call Stripe/Razorpay API here to get a session/order ID
        // return { gatewayOrderId: 'order_xxx', ... }

        // Generate a mock Razorpay-compatible order id
        const orderId = `order_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        return {
            id: orderId,               // Flutter reads orderData['id'] for Razorpay
            paymentId: payment.id,
            amount: amount * 100,      // Razorpay expects paise
            amount_inr: amount,
            currency: 'INR',
            status: 'created',
            gateway,
        };
    }

    // Simplified mock verification for MVP development
    async verifyMockPayment(userId: string, paymentId: string) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId, userId } });
        if (!payment) throw new BadRequestException('Payment not found');
        if (payment.status !== 'pending') return payment;

        payment.status = 'completed';
        payment.gatewayTxnId = `txn_${Math.random().toString(36).substr(2, 9)}`;
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
