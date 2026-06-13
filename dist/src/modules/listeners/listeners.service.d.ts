import { Repository } from 'typeorm';
import { ListenerProfile } from './entities/listener-profile.entity';
import { User } from '../users/entities/user.entity';
import { Rating } from '../users/entities/social.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ListenersService {
    private readonly listenerRepo;
    private readonly userRepo;
    private readonly ratingRepo;
    private readonly walletRepo;
    private readonly notificationsService;
    constructor(listenerRepo: Repository<ListenerProfile>, userRepo: Repository<User>, ratingRepo: Repository<Rating>, walletRepo: Repository<Wallet>, notificationsService: NotificationsService);
    apply(userId: string, data: any): Promise<ListenerProfile>;
    getAdminPending(page?: number, limit?: number): Promise<{
        items: ListenerProfile[];
        total: number;
        hasNext: boolean;
    }>;
    approveListener(id: string): Promise<ListenerProfile>;
    rejectListener(id: string, reason: string): Promise<ListenerProfile>;
    browse(currentUserId: string, filters: {
        category?: string;
        language?: string;
        minRating?: number;
        maxRate?: number;
        sort?: string;
        page?: number;
        limit?: number;
        name?: string;
        city?: string;
        minAge?: number;
        maxAge?: number;
    }): Promise<{
        listeners: {
            id: string;
            displayName: any;
            avatarUrl: any;
            headline: string;
            expertiseTags: string[];
            voiceRatePerMin: number;
            videoRatePerMin: number;
            age: number;
            city: string;
            avgRating: number;
            totalRatings: number;
            isAvailable: boolean;
            status: string;
            isVerified: boolean;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
        };
    }>;
    getDetail(listenerId: string): Promise<{
        reviews: {
            id: string;
            rating: number;
            reviewText: string;
            createdAt: Date;
            reviewerName: any;
            reviewerAvatar: any;
        }[];
        id: string;
        userId: string;
        headline: string;
        description: string;
        expertiseTags: string[];
        languages: string[];
        voiceRatePerMin: number;
        videoRatePerMin: number;
        chatRatePerMin: number;
        isAvailable: boolean;
        status: string;
        isVerified: boolean;
        isApproved: boolean;
        approvalStatus: string;
        totalCalls: number;
        totalMinutes: number;
        avgRating: number;
        totalRatings: number;
        totalEarnings: number;
        createdAt: Date;
        identityDocUrl: string;
        certificateUrl: string;
        introVideoUrl: string;
        rejectionReason: string;
        gender: string;
        age: number;
        city: string;
        uploadedAvatarUrl: string;
        updatedAt: Date;
        user: User;
    }>;
    submitRating(callerId: string, listenerId: string, callId: string, rating: number, reviewText?: string): Promise<Rating>;
    updateProfile(userId: string, data: Partial<ListenerProfile>): Promise<ListenerProfile>;
    toggleAvailability(userId: string, isAvailable: boolean): Promise<{
        isAvailable: boolean;
    }>;
    getEarnings(userId: string): Promise<{
        totalEarnings: number;
        totalCalls: number;
        totalMinutes: number;
        avgRating: number;
        totalRatings: number;
        currentBalance: number;
        isAvailable: boolean;
    }>;
    followListener(followerId: string, listenerId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
