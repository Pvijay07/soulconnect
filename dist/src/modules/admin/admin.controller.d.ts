import { AdminService } from './admin.service';
import { ListenersService } from '../listeners/listeners.service';
export declare class AdminController {
    private readonly adminService;
    private readonly listenersService;
    constructor(adminService: AdminService, listenersService: ListenersService);
    getAllUsers(page?: number, limit?: number, search?: string): Promise<{
        data: {
            items: {
                id: string;
                email: string;
                phone: string;
                role: import("../users/entities/user.entity").UserRole;
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
        };
    }>;
    getDashboard(): Promise<{
        data: {
            totalUsers: number;
            totalListeners: number;
            pendingApprovals: number;
            totalCalls: number;
            activeBanners: number;
            totalRevenue: number;
        };
    }>;
    getActiveBanners(): Promise<{
        data: import("./entities/banner.entity").Banner[];
    }>;
    getAllBanners(): Promise<{
        data: import("./entities/banner.entity").Banner[];
    }>;
    createBanner(dto: any): Promise<{
        data: import("./entities/banner.entity").Banner;
    }>;
    updateBanner(id: string, dto: any): Promise<{
        data: import("./entities/banner.entity").Banner;
    }>;
    deleteBanner(id: string): Promise<{
        data: {
            deleted: boolean;
        };
    }>;
    getPendingExperts(page?: number, limit?: number): Promise<{
        data: {
            items: import("../listeners/entities/listener-profile.entity").ListenerProfile[];
            total: number;
            hasNext: boolean;
        };
    }>;
    getAllExperts(page?: number, limit?: number): Promise<{
        data: {
            items: import("../listeners/entities/listener-profile.entity").ListenerProfile[];
            total: number;
            hasNext: boolean;
        };
    }>;
    approveExpert(id: string): Promise<{
        data: import("../listeners/entities/listener-profile.entity").ListenerProfile;
    }>;
    rejectExpert(id: string, reason: string): Promise<{
        data: import("../listeners/entities/listener-profile.entity").ListenerProfile;
    }>;
}
