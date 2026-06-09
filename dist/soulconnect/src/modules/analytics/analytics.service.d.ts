import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CallLog } from '../calls/entities/call.entity';
import { Transaction } from '../wallet/entities/transaction.entity';
export declare class AnalyticsService {
    private readonly userRepo;
    private readonly callRepo;
    private readonly transRepo;
    constructor(userRepo: Repository<User>, callRepo: Repository<CallLog>, transRepo: Repository<Transaction>);
    calculateLTV(): Promise<{
        totalRevenue: number;
        avgLTV: number;
    }>;
    getChurnRate(): Promise<{
        churnRate: number;
        activeUsers: number;
        totalUsers: number;
    }>;
    getRevenueStats(): Promise<any[]>;
}
