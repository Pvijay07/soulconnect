import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { User } from '../users/entities/user.entity';
import { Call } from '../calls/entities/call.entity';
import { Transaction } from '../wallet/entities/transaction.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Banner)
        private readonly bannerRepo: Repository<Banner>,
        @InjectRepository(ListenerProfile)
        private readonly listenerRepo: Repository<ListenerProfile>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Call)
        private readonly callRepo: Repository<Call>,
        @InjectRepository(Transaction)
        private readonly txnRepo: Repository<Transaction>,
    ) { }

    // ─── Banner CRUD ───────────────────────────────────────────

    async getActiveBanners() {
        const now = new Date();
        return this.bannerRepo.find({
            where: {
                isActive: true,
            },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async getAllBanners() {
        return this.bannerRepo.find({
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async createBanner(data: Partial<Banner>) {
        const banner = this.bannerRepo.create(data);
        return this.bannerRepo.save(banner);
    }

    async updateBanner(id: string, data: Partial<Banner>) {
        const banner = await this.bannerRepo.findOne({ where: { id } });
        if (!banner) throw new NotFoundException('Banner not found');
        Object.assign(banner, data);
        return this.bannerRepo.save(banner);
    }

    async deleteBanner(id: string) {
        const result = await this.bannerRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Banner not found');
        return { deleted: true };
    }

    // ─── Dashboard Stats ────────────────────────────────────────

    async getDashboardStats() {
        const totalUsers = await this.userRepo.count();
        const totalListeners = await this.listenerRepo.count({ where: { isApproved: true } });
        const pendingApprovals = await this.listenerRepo.count({ where: { approvalStatus: 'pending' } });
        const totalCalls = await this.callRepo.count();
        const activeBanners = await this.bannerRepo.count({ where: { isActive: true } });

        // Revenue (sum of all call debits)
        const revenueResult = await this.txnRepo
            .createQueryBuilder('t')
            .select('COALESCE(SUM(t.amount), 0)', 'total')
            .where("t.category = 'call_debit'")
            .getRawOne();

        return {
            totalUsers,
            totalListeners,
            pendingApprovals,
            totalCalls,
            activeBanners,
            totalRevenue: parseFloat(revenueResult?.total || '0'),
        };
    }

    // ─── Expert Verification ────────────────────────────────────

    async getPendingExperts(page = 1, limit = 20) {
        const [items, total] = await this.listenerRepo.findAndCount({
            where: { approvalStatus: 'pending' },
            relations: ['user', 'user.profile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, hasNext: page * limit < total };
    }

    async getAllExperts(page = 1, limit = 20) {
        const [items, total] = await this.listenerRepo.findAndCount({
            relations: ['user', 'user.profile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, hasNext: page * limit < total };
    }
}
