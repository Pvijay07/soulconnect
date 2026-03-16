import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
export declare class PaymentsWebhookController {
    private readonly paymentsService;
    private readonly configService;
    constructor(paymentsService: PaymentsService, configService: ConfigService);
    handleStripeWebhook(sig: string, req: any): Promise<{
        received: boolean;
    }>;
    handleRazorpayWebhook(sig: string, body: any): Promise<{
        received: boolean;
    }>;
}
