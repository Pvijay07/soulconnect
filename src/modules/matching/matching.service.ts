import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

@Injectable()
export class MatchingService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(ListenerProfile)
        private readonly lpRepo: Repository<ListenerProfile>,
        @InjectRepository(Interest)
        private readonly interestRepo: Repository<Interest>,
    ) { }

    /**
     * Finds the best matching listeners for a specific user
     */
    async getTopMatches(userId: string, limit = 10): Promise<MatchScoreResult[]> {
        // 1. Get user preferences and interests
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user) throw new NotFoundException('User not found');

        // For better matching, we'd ideally have a UserInterests join table. 
        // For now, let's assume we match based on the 'category' if provided, 
        // or look at available listeners.

        // 2. Fetch all available and approved listeners
        const listeners = await this.lpRepo.find({
            where: {
                isAvailable: true,
                isApproved: true
            },
            relations: ['user', 'user.profile'],
        });

        const results: MatchScoreResult[] = [];

        for (const listener of listeners) {
            const scoreData = this.calculateMatchScore(user, listener);
            results.push({
                listenerId: listener.userId,
                score: scoreData.score,
                reason: scoreData.reasons,
                displayName: listener.user?.profile?.displayName,
                avatarUrl: listener.user?.profile?.avatarUrl,
                headline: listener.headline,
                ratePerMin: Number(listener.voiceRatePerMin),
            });
        }

        // 3. Sort by score descending and return
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * Core scoring algorithm
     * Max score: 100
     */
    private calculateMatchScore(user: User, listener: ListenerProfile) {
        let score = 0;
        const reasons: string[] = [];

        // 1. Rating Factor (Max 30 points)
        // 5 stars = 30 pts, 4 stars = 24 pts...
        const ratingWeight = 30;
        const ratingScore = (Number(listener.avgRating) / 5) * ratingWeight;
        score += ratingScore;
        if (Number(listener.avgRating) >= 4.5) reasons.push('Highly rated by peers');

        // 2. Experience Factor (Max 20 points)
        // Based on total calls/minutes
        const experienceWeight = 20;
        if (listener.totalCalls > 100) {
            score += 20;
            reasons.push('Very experienced listener');
        } else if (listener.totalCalls > 20) {
            score += 10;
            reasons.push('Regularly active');
        }

        // 3. Language Match (Max 20 points)
        // Simple check if user and listener share any common language
        const userLangs = user.profile?.languages || ['en'];
        const listenerLangs = listener.languages || ['en'];
        const commonLangs = userLangs.filter(l => listenerLangs.includes(l));

        if (commonLangs.length > 0) {
            score += 20;
            reasons.push(`Speaks your language (${commonLangs[0]})`);
        }

        // 4. Verification Boost (Max 10 points)
        if (listener.isVerified) {
            score += 10;
            reasons.push('Verified Trusted Listener');
        }

        // 5. Freshness/Variety (Max 20 points)
        // Small random boost to ensure variety and help new listeners get discovered
        const varietyBoost = Math.random() * 20;
        score += varietyBoost;

        return { score: Math.round(score), reasons };
    }

    /**
     * Find listeners specifically by tags/interests
     */
    async findByInterests(tags: string[], limit = 10) {
        // This uses a more direct search for specific expertises
        const qb = this.lpRepo.createQueryBuilder('lp')
            .leftJoinAndSelect('lp.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('lp.isAvailable = :available', { available: true })
            .andWhere('lp.isApproved = :approved', { approved: true });

        // Simple partial match for tags in the JSONB array or string column
        // In production, would use GIN indexes and @> operator
        tags.forEach((tag, index) => {
            const paramName = `tag${index}`;
            qb.andWhere(`lp.expertiseTags LIKE :${paramName}`, { [paramName]: `%${tag}%` });
        });

        const listeners = await qb.orderBy('lp.avgRating', 'DESC').take(limit).getMany();

        return listeners.map(lp => ({
            id: lp.userId,
            displayName: lp.user?.profile?.displayName,
            expertise: lp.expertiseTags,
            rating: lp.avgRating,
            rate: lp.voiceRatePerMin,
        }));
    }

    /**
     * Random connect algorithm: pick one best available listener for instant connect
     */
    async randomConnect(userId: string, preferredLanguage?: string) {
        const now = new Date();

        // Step 1: get available & approved listeners
        let listeners = await this.lpRepo.find({ where: { isAvailable: true, isApproved: true }, relations: ['user'] });

        // Filter out very low rated
        listeners = listeners.filter(l => Number(l.avgRating || 0) >= 3.0);
        if (listeners.length === 0) return null;

        // Step 2: language matching
        const langMatched = preferredLanguage ? listeners.filter(l => (l.languages || []).includes(preferredLanguage)) : [];
        const pool = langMatched.length > 0 ? langMatched : listeners;

        // scoring
        const scoreOf = (l: ListenerProfile) => {
            const rating = (Number(l.avgRating) / 5) * 10; // 0..10
            const availabilitySecs = Math.max(0, (now.getTime() - (l.updatedAt?.getTime() || now.getTime())) / 1000);
            const availability = Math.min(1, availabilitySecs / 3600); // up to 1 hour
            const responseRate = Math.min(1, (Number(l.totalCalls) / (Number(l.totalCalls) + 50)) );
            const distribution = 1 / (1 + Number(l.totalCalls) / 10);

            return rating * 0.4 + availability * 10 * 0.2 + responseRate * 10 * 0.2 + distribution * 10 * 0.2;
        };

        pool.sort((a, b) => scoreOf(b) - scoreOf(a));

        const top = pool.slice(0, 3);
        const chosen = top.length === 1 ? top[0] : top[Math.floor(Math.random() * top.length)];

        if (!chosen) return null;

        // Lock expert: set as busy and not available
        chosen.isAvailable = false;
        chosen.status = 'busy';
        await this.lpRepo.save(chosen);

        return {
            listenerId: chosen.userId,
            displayName: chosen.user?.profile?.displayName,
            avatarUrl: chosen.user?.profile?.avatarUrl,
            headline: chosen.headline,
            ratePerMin: Number(chosen.voiceRatePerMin),
        };
    }
}
