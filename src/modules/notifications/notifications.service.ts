import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification, Device } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
        @InjectRepository(Device)
        private readonly deviceRepo: Repository<Device>,
        private readonly configService: ConfigService,
    ) {
        // In production: Initialize Firebase Admin SDK
        // admin.initializeApp({ ... });
    }

    async registerDevice(userId: string, deviceToken: string, platform: string, deviceInfo?: any) {
        let device = await this.deviceRepo.findOne({ where: { deviceToken } });

        if (device) {
            device.userId = userId;
            device.isActive = true;
            device.platform = platform;
            device.deviceInfo = deviceInfo;
        } else {
            device = this.deviceRepo.create({
                userId,
                deviceToken,
                platform,
                deviceInfo,
            });
        }

        await this.deviceRepo.save(device);
        return device;
    }

    async sendPushNotification(userId: string, title: string, body: string, data?: any, type = 'general') {
        const devices = await this.deviceRepo.find({ where: { userId, isActive: true } });

        if (devices.length === 0) return;

        // Create notification record
        const notification = this.notificationRepo.create({
            userId,
            title,
            body,
            type,
            data,
        });
        await this.notificationRepo.save(notification);

        for (const device of devices) {
            try {
                this.logger.log(`Sending PUSH to user ${userId} on ${device.platform}: ${title}`);

                // In production: Use FCM
                /*
                await admin.messaging().send({
                  token: device.deviceToken,
                  notification: { title, body },
                  data: { ...data, type },
                });
                */

                await this.notificationRepo.update(notification.id, { sentAt: new Date() });
            } catch (error) {
                this.logger.error(`Failed to send push to ${device.deviceToken}: ${error.message}`);
                if (error.code === 'messaging/registration-token-not-registered') {
                    await this.deviceRepo.update(device.id, { isActive: false });
                }
            }
        }
    }

    async getNotifications(userId: string, page = 1, limit = 20) {
        return this.notificationRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async markAsRead(notificationId: string) {
        await this.notificationRepo.update(notificationId, {
            isRead: true,
            readAt: new Date()
        });
        return { success: true };
    }
}
