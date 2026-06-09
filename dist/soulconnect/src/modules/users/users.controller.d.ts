import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateProfile(req: any, dto: any): Promise<{
        data: import("./entities/profile.entity").Profile;
    }>;
    getPublicProfile(id: string): Promise<{
        data: {
            id: string;
            isAnonymous: boolean;
            profile: {
                displayName: any;
                avatarUrl: any;
                bio: any;
                isOnline: any;
            };
            listenerProfile: {
                headline: any;
                expertiseTags: any;
                voiceRatePerMin: any;
                videoRatePerMin: any;
                avgRating: any;
                totalRatings: any;
                isAvailable: any;
            } | null;
        };
    }>;
    getInterests(): Promise<{
        data: import("./entities/interest.entity").Interest[];
    }>;
    getRatings(id: string, page?: number, limit?: number): Promise<{
        data: {
            ratings: import("./entities/social.entity").Rating[];
            total: number;
            page: number;
            limit: number;
            hasNext: boolean;
        };
    }>;
    rateUser(req: any, id: string, dto: any): Promise<{
        data: import("./entities/social.entity").Rating;
    }>;
    reportUser(req: any, id: string, dto: any): Promise<{
        data: import("./entities/social.entity").Report;
    }>;
    blockUser(req: any, id: string): Promise<{
        data: import("./entities/social.entity").BlockedUser;
    }>;
    unblockUser(req: any, id: string): Promise<{
        data: {
            message: string;
        };
    }>;
    getBlockedUsers(req: any): Promise<{
        data: import("./entities/social.entity").BlockedUser[];
    }>;
}
