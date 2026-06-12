import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { User } from '../users/entities/user.entity';
import { Call } from '../calls/entities/call.entity';
import { Transaction, TransactionType, TransactionCategory } from '../wallet/entities/transaction.entity';

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

    // ─── Users Management ────────────────────────────────────────

    async getAllUsers(page = 1, limit = 20, search?: string) {
        const qb = this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.wallet', 'wallet')
            .orderBy('user.createdAt', 'DESC');

        if (search) {
            qb.where(
                '(user.email ILIKE :search OR user.phone ILIKE :search OR profile.displayName ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        const [items, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            items: items.map(u => ({
                id: u.id,
                email: u.email,
                phone: u.phone,
                role: u.role,
                status: u.status,
                isAnonymous: u.isAnonymous,
                createdAt: u.createdAt,
                lastLoginAt: u.lastLoginAt,
                displayName: u.profile?.displayName,
                avatarUrl: u.profile?.avatarUrl,
                walletBalance: u.wallet?.balance ?? 0,
            })),
            total,
            hasNext: page * limit < total,
        };
    }

    async blockExpert(id: string) {
        // Block expert means blocking the underlying user
        const expert = await this.listenerRepo.findOne({ where: { id } });
        if (!expert) throw new NotFoundException('Expert not found');
        
        await this.userRepo.update(expert.userId, { status: 'blocked' as any });
        return { success: true, message: 'Expert blocked successfully' };
    }

    async processPayout(expertId: string, amount: number) {
        const expert = await this.listenerRepo.findOne({ where: { id: expertId } });
        if (!expert) throw new NotFoundException('Expert not found');

        const wallet = await this.txnRepo.manager.findOne('Wallet', { where: { userId: expert.userId } });
        if (!wallet) throw new NotFoundException('Wallet not found');

        if ((wallet as any).balance < amount) {
            throw new Error('Insufficient balance for payout');
        }

        // Deduct balance and record transaction
        await this.txnRepo.manager.transaction(async em => {
            await em.decrement('Wallet', { userId: expert.userId }, 'balance', amount);
            const txn = this.txnRepo.create({
                walletId: (wallet as any).id,
                amount: amount,
                type: TransactionType.DEBIT,
                category: TransactionCategory.WITHDRAWAL,
                description: 'Admin processed payout',
                referenceId: `payout-${Date.now()}`,
            });
            await em.save(txn);
        });

        return { success: true, message: 'Payout processed successfully' };
    }
}
