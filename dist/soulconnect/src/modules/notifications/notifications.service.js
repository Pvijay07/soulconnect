"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const notification_entity_1 = require("./entities/notification.entity");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    notificationRepo;
    deviceRepo;
    configService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(notificationRepo, deviceRepo, configService) {
        this.notificationRepo = notificationRepo;
        this.deviceRepo = deviceRepo;
        this.configService = configService;
    }
    async registerDevice(userId, deviceToken, platform, deviceInfo) {
        let device = await this.deviceRepo.findOne({ where: { deviceToken } });
        if (device) {
            device.userId = userId;
            device.isActive = true;
            device.platform = platform;
            device.deviceInfo = deviceInfo;
        }
        else {
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
    async sendPushNotification(userId, title, body, data, type = 'general') {
        const devices = await this.deviceRepo.find({ where: { userId, isActive: true } });
        if (devices.length === 0)
            return;
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
                await this.notificationRepo.update(notification.id, { sentAt: new Date() });
            }
            catch (error) {
                this.logger.error(`Failed to send push to ${device.deviceToken}: ${error.message}`);
                if (error.code === 'messaging/registration-token-not-registered') {
                    await this.deviceRepo.update(device.id, { isActive: false });
                }
            }
        }
    }
    async getNotifications(userId, page = 1, limit = 20) {
        return this.notificationRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    async markAsRead(notificationId) {
        await this.notificationRepo.update(notificationId, {
            isRead: true,
            readAt: new Date()
        });
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_entity_1.Device)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map