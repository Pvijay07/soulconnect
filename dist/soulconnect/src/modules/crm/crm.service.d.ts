import { ConfigService } from '@nestjs/config';
export declare class CRMService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendMarketingEmail(to: string, template: string, data: any): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendPromotionalSMS(phone: string, message: string): Promise<{
        success: boolean;
        sid: string;
    }>;
    triggerPushCampaign(userIds: string[], title: string, body: string): Promise<{
        success: boolean;
        campaignId: string;
    }>;
}
