import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { Interest } from '../users/entities/interest.entity';
export interface MatchScoreResult {
    listenerId: string;
    score: number;
    reason: string[];
    displayName?: string;
    avatarUrl?: string;
    headline?: string;
    ratePerMin: number;
}
export declare class MatchingService {
    private readonly userRepo;
    private readonly lpRepo;
    private readonly interestRepo;
    constructor(userRepo: Repository<User>, lpRepo: Repository<ListenerProfile>, interestRepo: Repository<Interest>);
    getTopMatches(userId: string, limit?: number): Promise<MatchScoreResult[]>;
    private calculateMatchScore;
    findByInterests(tags: string[], limit?: number): Promise<{
        id: string;
        displayName: any;
        expertise: string[];
        rating: number;
        rate: number;
    }[]>;
    randomConnect(userId: string, preferredLanguage?: string): Promise<{
        listenerId: string;
        displayName: any;
        avatarUrl: any;
        headline: string;
        ratePerMin: number;
    } | null>;
}
