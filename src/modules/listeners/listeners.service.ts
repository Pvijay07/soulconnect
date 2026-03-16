import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListenerProfile } from './entities/listener-profile.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Rating } from '../users/entities/social.entity';
import { Wallet } from '../wallet/entities/wallet.entity';

@Injectable()
export class ListenersService {
    constructor(
        @InjectRepository(ListenerProfile)
        private readonly listenerRepo: Repository<ListenerProfile>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Rating)
        private readonly ratingRepo: Repository<Rating>,
        @InjectRepository(Wallet)
        private readonly walletRepo: Repository<Wallet>,
    ) { }

    async apply(userId: string, data: any) {
        let profile = await this.listenerRepo.findOne({ where: { userId } });

        if (profile) {
            if (profile.approvalStatus === 'approved') throw new BadRequestException('Already an approved listener');
            // If rejected or pending, we allow updating the application
        } else {
            profile = this.listenerRepo.create({ userId });
        }

        Object.assign(profile, {
            headline: data.headline,
            description: data.description,
            expertiseTags: data.expertiseTags || [],
            languages: data.languages || ['en'],
            voiceRatePerMin: data.voiceRatePerMin || 10,
            videoRatePerMin: data.videoRatePerMin || 20,
            gender: data.gender,
            age: data.age,
            identityDocUrl: data.identityDocUrl,
            certificateUrl: data.certificateUrl,
            introVideoUrl: data.introVideoUrl,
            approvalStatus: 'pending',
            isApproved: false,
        });

        await this.listenerRepo.save(profile);
        return profile;
    }

    async getAdminPending(page = 1, limit = 20) {
        const [items, total] = await this.listenerRepo.findAndCount({
            where: { approvalStatus: 'pending' },
            relations: ['user', 'user.profile'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, hasNext: page * limit < total };
    }

    async approveListener(userId: string) {
        const profile = await this.listenerRepo.findOne({ where: { userId } });
        if (!profile) throw new NotFoundException('Listener profile not found');

        profile.approvalStatus = 'approved';
        profile.isApproved = true;
        profile.isVerified = true;
        await this.listenerRepo.save(profile);

        // Update user role to LISTENER
        await this.userRepo.update(userId, { role: UserRole.LISTENER });

        return profile;
    }

    async rejectListener(userId: string, reason: string) {
        const profile = await this.listenerRepo.findOne({ where: { userId } });
        if (!profile) throw new NotFoundException('Listener profile not found');

        profile.approvalStatus = 'rejected';
        profile.isApproved = false;
        profile.rejectionReason = reason;
        await this.listenerRepo.save(profile);

        return profile;
    }

    async browse(filters: {
        category?: string;
        language?: string;
        minRating?: number;
        maxRate?: number;
        sort?: string;
        page?: number;
        limit?: number;
    }) {
        const qb = this.listenerRepo
            .createQueryBuilder('lp')
            .leftJoinAndSelect('lp.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('lp.isApproved = :approved', { approved: true })
            .andWhere('user.status = :status', { status: 'active' });

        if (filters.language) {
            qb.andWhere('lp.languages LIKE :lang', { lang: `%${filters.language}%` });
        }
        if (filters.minRating) {
            qb.andWhere('lp.avgRating >= :minRating', { minRating: filters.minRating });
        }
        if (filters.maxRate) {
            qb.andWhere('lp.voiceRatePerMin <= :maxRate', { maxRate: filters.maxRate });
        }
        if (filters.category) {
            qb.andWhere('lp.expertiseTags LIKE :cat', { cat: `%${filters.category}%` });
        }

        // Sorting
        switch (filters.sort) {
            case 'rating': qb.orderBy('lp.avgRating', 'DESC'); break;
            case 'price_low': qb.orderBy('lp.voiceRatePerMin', 'ASC'); break;
            case 'price_high': qb.orderBy('lp.voiceRatePerMin', 'DESC'); break;
            case 'popular': qb.orderBy('lp.totalCalls', 'DESC'); break;
            default: qb.orderBy('lp.avgRating', 'DESC');
        }

        const page = filters.page || 1;
        const limit = filters.limit || 20;
        qb.skip((page - 1) * limit).take(limit);

        const [listeners, total] = await qb.getManyAndCount();

        return {
            listeners: listeners.map(lp => ({
                id: lp.userId,
                displayName: lp.user?.profile?.displayName,
                avatarUrl: lp.user?.profile?.avatarUrl,
                headline: lp.headline,
                expertiseTags: lp.expertiseTags,
                voiceRatePerMin: lp.voiceRatePerMin,
                videoRatePerMin: lp.videoRatePerMin,
                avgRating: lp.avgRating,
                totalRatings: lp.totalRatings,
                isAvailable: lp.isAvailable,
                isVerified: lp.isVerified,
            })),
            pagination: { page, limit, total, hasNext: page * limit < total },
        };
    }

    async getDetail(listenerId: string) {
        const lp = await this.listenerRepo.findOne({
            where: { userId: listenerId },
            relations: ['user', 'user.profile'],
        });
        if (!lp) throw new NotFoundException('Listener not found');

        // Fetch top 5 reviews
        const reviews = await this.ratingRepo.find({
            where: { revieweeId: listenerId, isVisible: true },
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['reviewer', 'reviewer.profile'],
        });

        return {
            ...lp,
            reviews: reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                reviewText: r.reviewText,
                createdAt: r.createdAt,
                reviewerName: r.reviewer?.profile?.displayName || 'Unknown User',
                reviewerAvatar: r.reviewer?.profile?.avatarUrl,
            })),
        };
    }

    async submitRating(callerId: string, listenerId: string, callId: string, rating: number, reviewText?: string) {
        if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be between 1 and 5');

        const review = this.ratingRepo.create({
            reviewerId: callerId,
            revieweeId: listenerId,
            callId,
            rating,
            reviewText,
        });
        await this.ratingRepo.save(review);

        // Recalculate average rating for listener profile
        const lp = await this.listenerRepo.findOne({ where: { userId: listenerId } });
        if (lp) {
            const currentTotal = Number(lp.avgRating) * lp.totalRatings;
            lp.totalRatings += 1;
            lp.avgRating = (currentTotal + rating) / lp.totalRatings;
            await this.listenerRepo.save(lp);
        }

        return review;
    }

    async updateProfile(userId: string, data: Partial<ListenerProfile>) {
        const lp = await this.listenerRepo.findOne({ where: { userId } });
        if (!lp) throw new NotFoundException('Listener profile not found');
        Object.assign(lp, data);
        return this.listenerRepo.save(lp);
    }

    async toggleAvailability(userId: string, isAvailable: boolean) {
        await this.listenerRepo.update({ userId }, { isAvailable });
        return { isAvailable };
    }

    async getEarnings(userId: string) {
        const lp = await this.listenerRepo.findOne({ where: { userId } });
        if (!lp) throw new NotFoundException('Listener profile not found');

        const wallet = await this.walletRepo.findOne({ where: { userId } });

        return {
            totalEarnings: lp.totalEarnings,
            totalCalls: lp.totalCalls,
            totalMinutes: lp.totalMinutes,
            avgRating: lp.avgRating,
            totalRatings: lp.totalRatings,
            currentBalance: wallet ? wallet.balance : 0,
        };
    }
}
