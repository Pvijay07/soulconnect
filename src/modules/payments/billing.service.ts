import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentBillingService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepo: Repository<Invoice>,
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    /**
     * Generates a GST compliant invoice for a payment
     */
    async generateInvoice(paymentId: string) {
        const payment = await this.paymentRepo.findOne({
            where: { id: paymentId },
            relations: ['user']
        });
        if (!payment) throw new NotFoundException('Payment not found');

        const amount = Number(payment.amount);
        const gstRate = 18; // 18% GST for services in India
        const taxAmount = (amount * gstRate) / 100;
        const totalAmount = amount + taxAmount;

        const invoiceCount = await this.invoiceRepo.count();
        const invoiceNumber = `SC-INV-${new Date().getFullYear()}-${1000 + invoiceCount + 1}`;

        const invoice = this.invoiceRepo.create({
            invoiceNumber,
            userId: payment.userId,
            paymentId: payment.id,
            amount,
            taxRate: gstRate,
            taxAmount,
            totalAmount,
            currency: payment.currency,
            status: 'paid',
        });

        return await this.invoiceRepo.save(invoice);
    }

    async getUserInvoices(userId: string) {
        return this.invoiceRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async getInvoicePdfData(invoiceId: string) {
        const invoice = await this.invoiceRepo.findOne({
            where: { id: invoiceId },
            relations: ['user', 'user.profile']
        });
        if (!invoice) throw new NotFoundException('Invoice not found');

        // In production: Return a buffer from a PDF library like PDFKit
        return {
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.createdAt,
            customerName: invoice.user?.profile?.displayName,
            baseAmount: invoice.amount,
            gstAmount: invoice.taxAmount,
            total: invoice.totalAmount,
            platformGst: '29ABCDE1234F1Z5', // Mock Platform GST
        };
    }
}
