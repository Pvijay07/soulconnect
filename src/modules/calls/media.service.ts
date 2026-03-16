import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);
    private client: Twilio;
    private accountSid: string;
    private apiKey: string;
    private apiSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.accountSid = this.configService.get<string>('twilio.accountSid') || '';
        const authToken = this.configService.get<string>('twilio.authToken') || '';
        this.apiKey = this.configService.get<string>('twilio.apiKey') || '';
        this.apiSecret = this.configService.get<string>('twilio.apiSecret') || '';

        if (this.accountSid && authToken && !this.accountSid.startsWith('AC_Your')) {
            this.client = new Twilio(this.accountSid, authToken);
            this.logger.log('Twilio client initialized');
        } else {
            this.logger.warn('Twilio credentials not set — using mock mode for calls');
        }
    }

    /**
     * Creates a Twilio Video Room (SFU Group) or returns a mock room
     */
    async createRoom(uniqueName: string) {
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
        } catch (error) {
            this.logger.error(`Failed to create Twilio room: ${error.message}`);
            // Fallback to mock so calls don't break
            return { sid: `fallback_room_${uniqueName}`, uniqueName };
        }
    }

    /**
     * Generates a Twilio Access Token for WebRTC video/audio
     */
    generateAccessToken(identity: string, roomName: string): string {
        if (!this.apiKey || !this.apiSecret || !this.accountSid || this.apiKey.startsWith('SK_Your')) {
            this.logger.warn(`Mock access token for: ${identity} in ${roomName}`);
            return `mock_jwt_${identity}_${roomName}_${Date.now()}`;
        }

        try {
            // Dynamic require to avoid issues if twilio isn't configured
            const AccessToken = require('twilio').jwt.AccessToken;
            const VideoGrant = AccessToken.VideoGrant;

            const token = new AccessToken(this.accountSid, this.apiKey, this.apiSecret, {
                identity,
                ttl: 3600, // 1 hour
            });

            const videoGrant = new VideoGrant({ room: roomName });
            token.addGrant(videoGrant);

            return token.toJwt();
        } catch (error) {
            this.logger.error(`Failed to generate access token: ${error.message}`);
            return `fallback_jwt_${identity}_${roomName}`;
        }
    }
}
