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
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = require("twilio");
let MediaService = MediaService_1 = class MediaService {
    configService;
    logger = new common_1.Logger(MediaService_1.name);
    client;
    accountSid;
    apiKey;
    apiSecret;
    constructor(configService) {
        this.configService = configService;
        this.accountSid = this.configService.get('twilio.accountSid') || '';
        const authToken = this.configService.get('twilio.authToken') || '';
        this.apiKey = this.configService.get('twilio.apiKey') || '';
        this.apiSecret = this.configService.get('twilio.apiSecret') || '';
        if (this.accountSid && authToken && !this.accountSid.startsWith('AC_Your')) {
            this.client = new twilio_1.Twilio(this.accountSid, authToken);
            this.logger.log('Twilio client initialized');
        }
        else {
            this.logger.warn('Twilio credentials not set — using mock mode for calls');
        }
    }
    async createRoom(uniqueName) {
        if (!this.client) {
            this.logger.warn(`Mock room created for: ${uniqueName}`);
            return { sid: `mock_room_${uniqueName}`, uniqueName };
        }
        try {
            const room = await this.client.video.v1.rooms.create({
                uniqueName,
                type: 'group',
                maxParticipants: 2,
                unusedRoomTimeout: 5,
                emptyRoomTimeout: 2,
            });
            this.logger.log(`Twilio room created: ${room.sid}`);
            return room;
        }
        catch (error) {
            this.logger.error(`Failed to create Twilio room: ${error.message}`);
            return { sid: `fallback_room_${uniqueName}`, uniqueName };
        }
    }
    generateAccessToken(identity, roomName) {
        if (!this.apiKey || !this.apiSecret || !this.accountSid || this.apiKey.startsWith('SK_Your')) {
            this.logger.warn(`Mock access token for: ${identity} in ${roomName}`);
            return `mock_jwt_${identity}_${roomName}_${Date.now()}`;
        }
        try {
            const AccessToken = require('twilio').jwt.AccessToken;
            const VideoGrant = AccessToken.VideoGrant;
            const token = new AccessToken(this.accountSid, this.apiKey, this.apiSecret, {
                identity,
                ttl: 3600,
            });
            const videoGrant = new VideoGrant({ room: roomName });
            token.addGrant(videoGrant);
            return token.toJwt();
        }
        catch (error) {
            this.logger.error(`Failed to generate access token: ${error.message}`);
            return `fallback_jwt_${identity}_${roomName}`;
        }
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map