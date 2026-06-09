import { User } from '../../users/entities/user.entity';
export declare class Payment {
    id: string;
    userId: string;
    gateway: string;
    gatewayTxnId: string;
    amount: number;
    currency: string;
    status: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
