import { ListenersService } from './listeners.service';
export declare class ListenersController {
    private readonly listenersService;
    constructor(listenersService: ListenersService);
    apply(req: any, dto: any): Promise<{
        data: import("./entities/listener-profile.entity").ListenerProfile;
    }>;
    browse(category?: string, language?: string, minRating?: number, maxRate?: number, sort?: string, page?: number, limit?: number): Promise<{
        data: {
            listeners: {
                id: string;
                displayName: any;
                avatarUrl: any;
                headline: string;
                expertiseTags: string[];
                voiceRatePerMin: number;
                videoRatePerMin: number;
                avgRating: number;
                totalRatings: number;
                isAvailable: boolean;
                isVerified: boolean;
            }[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                hasNext: boolean;
            };
        };
    }>;
    getEarnings(req: any): Promise<{
        data: {
            totalEarnings: number;
            totalCalls: number;
            totalMinutes: number;
            avgRating: number;
            totalRatings: number;
            currentBalance: number;
        };
    }>;
    toggleAvailability(req: any, isAvailable: boolean): Promise<{
        data: {
            isAvailable: boolean;
        };
    }>;
    updateProfile(req: any, dto: any): Promise<{
        data: import("./entities/listener-profile.entity").ListenerProfile;
    }>;
    getDetail(id: string): Promise<{
        data: {
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
            updatedAt: Date;
            user: import("../users/entities/user.entity").User;
        };
    }>;
    submitRating(req: any, id: string, dto: {
        callId: string;
        rating: number;
        reviewText?: string;
    }): Promise<{
        data: import("../users/entities/social.entity").Rating;
    }>;
    getPending(page?: number, limit?: number): Promise<{
        data: {
            items: import("./entities/listener-profile.entity").ListenerProfile[];
            total: number;
            hasNext: boolean;
        };
    }>;
    approve(id: string): Promise<{
        data: import("./entities/listener-profile.entity").ListenerProfile;
    }>;
    reject(id: string, reason: string): Promise<{
        data: import("./entities/listener-profile.entity").ListenerProfile;
    }>;
}
