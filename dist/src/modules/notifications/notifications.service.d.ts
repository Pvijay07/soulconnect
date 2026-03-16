import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification, Device } from './entities/notification.entity';
export declare class NotificationsService {
    private readonly notificationRepo;
    private readonly deviceRepo;
    private readonly configService;
    private readonly logger;
    constructor(notificationRepo: Repository<Notification>, deviceRepo: Repository<Device>, configService: ConfigService);
    registerDevice(userId: string, deviceToken: string, platform: string, deviceInfo?: any): Promise<Device>;
    sendPushNotification(userId: string, title: string, body: string, data?: any, type?: string): Promise<void>;
    getNotifications(userId: string, page?: number, limit?: number): Promise<Notification[]>;
    markAsRead(notificationId: string): Promise<{
        success: boolean;
    }>;
}
