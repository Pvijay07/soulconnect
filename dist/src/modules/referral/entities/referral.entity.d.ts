import { User } from '../../users/entities/user.entity';
export declare class Referral {
    id: string;
    referrer: User;
    referrerId: string;
    referred: User;
    referredId: string;
    status: 'pending' | 'completed' | 'rewarded';
    rewardAmount: number;
    createdAt: Date;
}
