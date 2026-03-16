import { Controller, Post, Body, Headers, BadRequestException, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Payment Webhooks')
@Controller('webhooks/payments')
export class PaymentsWebhookController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly configService: ConfigService,
    ) { }

    @Post('stripe')
    @ApiOperation({ summary: 'Stripe Webhook Handler' })
    async handleStripeWebhook(@Headers('stripe-signature') sig: string, @Req() req: any) {
        // In production, verify signature with stripe library
        // const event = stripe.webhooks.constructEvent(req.rawBody, sig, secret);

        const event = req.body; // Simplified for now

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata.userId;
            const paymentId = session.metadata.paymentId;

            await this.paymentsService.verifyMockPayment(userId, paymentId);
        }

        return { received: true };
    }

    @Post('razorpay')
    @ApiOperation({ summary: 'Razorpay Webhook Handler' })
    async handleRazorpayWebhook(@Headers('x-razorpay-signature') sig: string, @Body() body: any) {
        // In production, verify signature
        // Razorpay.validateWebhookSignature(JSON.stringify(body), sig, secret);

        if (body.event === 'payment.captured') {
            const payload = body.payload.payment.entity;
            const userId = payload.notes.userId;
            const paymentId = payload.notes.paymentId;

            await this.paymentsService.verifyMockPayment(userId, paymentId);
        }

        return { received: true };
    }
}
