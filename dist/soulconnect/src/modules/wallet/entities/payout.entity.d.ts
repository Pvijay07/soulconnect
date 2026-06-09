import { User } from '../../users/entities/user.entity';
export declare class Payout {
    id: string;
    listener: User;
    listenerId: string;
    amount: number;
    currency: string;
    bankDetails: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
        bankName: string;
    };
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transactionReference: string;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
}
