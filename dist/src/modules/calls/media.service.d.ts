import { ConfigService } from '@nestjs/config';
export declare class MediaService {
    private readonly configService;
    private readonly logger;
    private client;
    private accountSid;
    private apiKey;
    private apiSecret;
    constructor(configService: ConfigService);
    createRoom(uniqueName: string): Promise<any>;
    generateAccessToken(identity: string, roomName: string): string;
}
