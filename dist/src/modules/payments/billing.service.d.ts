import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
export declare class PaymentBillingService {
    private readonly invoiceRepo;
    private readonly paymentRepo;
    private readonly userRepo;
    constructor(invoiceRepo: Repository<Invoice>, paymentRepo: Repository<Payment>, userRepo: Repository<User>);
    generateInvoice(paymentId: string): Promise<Invoice>;
    getUserInvoices(userId: string): Promise<Invoice[]>;
    getInvoicePdfData(invoiceId: string): Promise<{
        invoiceNumber: string;
        date: Date;
        customerName: any;
        baseAmount: number;
        gstAmount: number;
        total: number;
        platformGst: string;
    }>;
}
