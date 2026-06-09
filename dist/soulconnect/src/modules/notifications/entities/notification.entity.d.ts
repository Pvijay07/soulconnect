import { User } from '../../users/entities/user.entity';
export declare class Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: string;
    data: Record<string, any>;
    isRead: boolean;
    sentAt: Date;
    readAt: Date;
    createdAt: Date;
    user: User;
}
export declare class Device {
    id: string;
    userId: string;
    deviceToken: string;
    platform: string;
    deviceInfo: Record<string, any>;
    isActive: boolean;
    createdAt: Date;
    user: User;
}
