import { ConfigService } from '@nestjs/config';
export declare class MediaService {
    private readonly configService;
    private readonly logger;
    private client;
    private accountSid;
    private apiKey;
    private apiSecret;
    constructor(configService: ConfigService);
    createRoom(uniqueName: string): Promise<import("twilio/lib/rest/video/v1/room").RoomInstance | {
        sid: string;
        uniqueName: string;
    }>;
    generateAccessToken(identity: string, roomName: string): string;
}
