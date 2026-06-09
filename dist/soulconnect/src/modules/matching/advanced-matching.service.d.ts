import { Repository } from 'typeorm';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { User } from '../users/entities/user.entity';
export declare class AdvancedMatchingService {
    private readonly lpRepo;
    private readonly userRepo;
    constructor(lpRepo: Repository<ListenerProfile>, userRepo: Repository<User>);
    getDeepMatches(userId: string, limit?: number): Promise<{
        listenerId: string;
        displayName: any;
        avatarUrl: any;
        headline: string;
        similarity: number;
        matchReason: string;
    }[]>;
    private simulateEmbedding;
    private calculateCosineSimilarity;
    private generateMatchReason;
}
