import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Interest } from './entities/interest.entity';
import { BlockedUser, Rating, Report } from './entities/social.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Profile)
        private readonly profileRepo: Repository<Profile>,
        @InjectRepository(Interest)
        private readonly interestRepo: Repository<Interest>,
        @InjectRepository(Rating)
        private readonly ratingRepo: Repository<Rating>,
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,
        @InjectRepository(BlockedUser)
        private readonly blockedRepo: Repository<BlockedUser>,
    ) { }

    async updateProfile(userId: string, data: Partial<Profile>) {
        const profile = await this.profileRepo.findOne({ where: { userId } });
        if (!profile) throw new NotFoundException('Profile not found');
        Object.assign(profile, data);
        return this.profileRepo.save(profile);
    }

    async getPublicProfile(userId: string) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['profile', 'listenerProfile'],
        });
        if (!user) throw new NotFoundException('User not found');

        return {
            id: user.id,
            isAnonymous: user.isAnonymous,
            profile: {
                displayName: user.profile?.displayName,
                avatarUrl: user.profile?.avatarUrl,
                bio: user.profile?.bio,
                isOnline: user.profile?.isOnline,
            },
            listenerProfile: user.listenerProfile ? {
                headline: user.listenerProfile.headline,
                expertiseTags: user.listenerProfile.expertiseTags,
                voiceRatePerMin: user.listenerProfile.voiceRatePerMin,
                videoRatePerMin: user.listenerProfile.videoRatePerMin,
                avgRating: user.listenerProfile.avgRating,
                totalRatings: user.listenerProfile.totalRatings,
                isAvailable: user.listenerProfile.isAvailable,
            } : null,
        };
    }

    async getAllInterests() {
        return this.interestRepo.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }

    async rateUser(reviewerId: string, revieweeId: string, callId: string, rating: number, reviewText?: string) {
        const ratingEntity = this.ratingRepo.create({
            callId, reviewerId, revieweeId, rating, reviewText,
        });
        return this.ratingRepo.save(ratingEntity);
    }

    async getUserRatings(userId: string, page = 1, limit = 20) {
        const [ratings, total] = await this.ratingRepo.findAndCount({
            where: { revieweeId: userId, isVisible: true },
            relations: ['reviewer'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { ratings, total, page, limit, hasNext: page * limit < total };
    }

    async reportUser(reporterId: string, reportedId: string, reason: string, description?: string) {
        const report = this.reportRepo.create({
            reporterId, reportedId, reason, description,
        });
        return this.reportRepo.save(report);
    }

    async blockUser(blockerId: string, blockedId: string) {
        const existing = await this.blockedRepo.findOne({ where: { blockerId, blockedId } });
        if (existing) return existing;
        const block = this.blockedRepo.create({ blockerId, blockedId });
        return this.blockedRepo.save(block);
    }

    async unblockUser(blockerId: string, blockedId: string) {
        await this.blockedRepo.delete({ blockerId, blockedId });
        return { message: 'User unblocked' };
    }

    async getBlockedUsers(userId: string) {
        return this.blockedRepo.find({
            where: { blockerId: userId },
            relations: ['blocked'],
        });
    }
}
