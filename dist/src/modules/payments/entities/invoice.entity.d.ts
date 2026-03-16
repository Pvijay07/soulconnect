import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';
export declare class Invoice {
    id: string;
    invoiceNumber: string;
    user: User;
    userId: string;
    payment: Payment;
    paymentId: string;
    amount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    billingAddress: string;
    gstNumber: string;
    status: string;
    createdAt: Date;
}
