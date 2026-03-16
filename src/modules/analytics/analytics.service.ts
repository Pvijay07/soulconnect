import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CallLog } from '../calls/entities/call.entity';
import { Transaction } from '../wallet/entities/transaction.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(CallLog)
        private readonly callRepo: Repository<CallLog>,
        @InjectRepository(Transaction)
        private readonly transRepo: Repository<Transaction>,
    ) { }

    /**
     * Calculates platform-wide LTV (Lifetime Value)
     */
    async calculateLTV() {
        const totalRevenue = await this.transRepo.createQueryBuilder('t')
            .where('t.type = :type', { type: 'recharge' })
            .select('SUM(t.amount)', 'total')
            .getRawOne();

        const totalUsers = await this.userRepo.count();

        return {
            totalRevenue: Number(totalRevenue.total || 0),
            avgLTV: totalUsers > 0 ? Number(totalRevenue.total || 0) / totalUsers : 0,
        };
    }

    /**
     * Estimates Churn Rate (Percentage of users inactive for 30 days)
     */
    async getChurnRate() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = await this.userRepo.createQueryBuilder('u')
            .where('u.updatedAt > :date', { date: thirtyDaysAgo })
            .getCount();

        const totalUsers = await this.userRepo.count();
        const lostUsers = totalUsers - activeUsers;

        return {
            churnRate: totalUsers > 0 ? (lostUsers / totalUsers) * 100 : 0,
            activeUsers,
            totalUsers,
        };
    }

    /**
     * Get revenue distribution by time
     */
    async getRevenueStats() {
        return this.transRepo.createQueryBuilder('t')
            .select("DATE_TRUNC('day', t.createdAt)", 'date')
            .addSelect('SUM(t.amount)', 'amount')
            .where('t.type = :type', { type: 'recharge' })
            .groupBy('date')
            .orderBy('date', 'ASC')
            .getRawMany();
    }
}
