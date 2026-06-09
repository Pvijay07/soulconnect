import { User } from '../../users/entities/user.entity';
export declare class Rating {
    id: string;
    callId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    reviewText: string;
    isVisible: boolean;
    createdAt: Date;
    reviewer: User;
    reviewee: User;
}
export declare class Report {
    id: string;
    reporterId: string;
    reportedId: string;
    reason: string;
    description: string;
    evidenceUrls: string[];
    status: string;
    adminNotes: string;
    resolvedBy: string;
    createdAt: Date;
    resolvedAt: Date;
    reporter: User;
    reported: User;
}
export declare class BlockedUser {
    id: string;
    blockerId: string;
    blockedId: string;
    createdAt: Date;
    blocker: User;
    blocked: User;
}
