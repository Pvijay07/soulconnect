import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Interest } from './entities/interest.entity';
import { BlockedUser, Rating, Report } from './entities/social.entity';
export declare class UsersService {
    private readonly userRepo;
    private readonly profileRepo;
    private readonly interestRepo;
    private readonly ratingRepo;
    private readonly reportRepo;
    private readonly blockedRepo;
    constructor(userRepo: Repository<User>, profileRepo: Repository<Profile>, interestRepo: Repository<Interest>, ratingRepo: Repository<Rating>, reportRepo: Repository<Report>, blockedRepo: Repository<BlockedUser>);
    updateProfile(userId: string, data: Partial<Profile>): Promise<Profile>;
    getPublicProfile(userId: string): Promise<{
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
    }>;
    getAllInterests(): Promise<Interest[]>;
    rateUser(reviewerId: string, revieweeId: string, callId: string, rating: number, reviewText?: string): Promise<Rating>;
    getUserRatings(userId: string, page?: number, limit?: number): Promise<{
        ratings: Rating[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
    }>;
    reportUser(reporterId: string, reportedId: string, reason: string, description?: string): Promise<Report>;
    blockUser(blockerId: string, blockedId: string): Promise<BlockedUser>;
    unblockUser(blockerId: string, blockedId: string): Promise<{
        message: string;
    }>;
    getBlockedUsers(userId: string): Promise<BlockedUser[]>;
}
