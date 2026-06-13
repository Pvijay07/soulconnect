import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Call } from '../calls/entities/call.entity';
import { Transaction } from '../wallet/entities/transaction.entity';
import { PayoutService } from '../wallet/payout.service';
import { ChatGateway } from '../chat/gateways/chat.gateway';
export declare class AdminService {
    private readonly bannerRepo;
    private readonly listenerRepo;
    private readonly userRepo;
    private readonly callRepo;
    private readonly txnRepo;
    private readonly payoutService;
    private readonly chatGateway;
    constructor(bannerRepo: Repository<Banner>, listenerRepo: Repository<ListenerProfile>, userRepo: Repository<User>, callRepo: Repository<Call>, txnRepo: Repository<Transaction>, payoutService: PayoutService, chatGateway: ChatGateway);
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
    getAllUsers(page?: number, limit?: number, search?: string): Promise<{
        items: {
            id: string;
            email: string;
            phone: string;
            role: UserRole;
            status: import("../users/entities/user.entity").UserStatus;
            isAnonymous: boolean;
            createdAt: Date;
            lastLoginAt: Date;
            displayName: any;
            avatarUrl: any;
            walletBalance: any;
        }[];
        total: number;
        hasNext: boolean;
    }>;
    getSupportAgent(): Promise<{
        id: string;
    }>;
    getSupportChats(): Promise<Map<string, Set<string>>>;
    blockExpert(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllPayouts(status?: string): Promise<import("../wallet/entities/payout.entity").Payout[]>;
    processPayout(payoutId: string, status: 'processing' | 'completed' | 'failed', remarks?: string, reference?: string): Promise<import("../wallet/entities/payout.entity").Payout>;
    sendPromotion(dto: {
        title: string;
        body: string;
        type: 'push' | 'sms';
        audience: 'all' | 'users' | 'experts';
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
