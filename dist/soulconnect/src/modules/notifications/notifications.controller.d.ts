import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    registerDevice(req: any, dto: {
        token: string;
        platform: string;
        deviceInfo?: any;
    }): Promise<{
        data: import("./entities/notification.entity").Device;
    }>;
    getNotifications(req: any, page?: number, limit?: number): Promise<{
        data: import("./entities/notification.entity").Notification[];
    }>;
    markAsRead(id: string): Promise<{
        data: {
            success: boolean;
        };
    }>;
}
