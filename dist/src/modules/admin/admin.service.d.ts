import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { User } from '../users/entities/user.entity';
import { Call } from '../calls/entities/call.entity';
import { Transaction } from '../wallet/entities/transaction.entity';
export declare class AdminService {
    private readonly bannerRepo;
    private readonly listenerRepo;
    private readonly userRepo;
    private readonly callRepo;
    private readonly txnRepo;
    constructor(bannerRepo: Repository<Banner>, listenerRepo: Repository<ListenerProfile>, userRepo: Repository<User>, callRepo: Repository<Call>, txnRepo: Repository<Transaction>);
    getActiveBanners(): Promise<Banner[]>;
    getAllBanners(): Promise<Banner[]>;
    createBanner(data: Partial<Banner>): Promise<Banner>;
    updateBanner(id: string, data: Partial<Banner>): Promise<Banner>;
    deleteBanner(id: string): Promise<{
        deleted: boolean;
    }>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalListeners: number;
        pendingApprovals: number;
        totalCalls: number;
        activeBanners: number;
        totalRevenue: number;
    }>;
    getPendingExperts(page?: number, limit?: number): Promise<{
        items: ListenerProfile[];
        total: number;
        hasNext: boolean;
    }>;
    getAllExperts(page?: number, limit?: number): Promise<{
        items: ListenerProfile[];
        total: number;
        hasNext: boolean;
    }>;
}
