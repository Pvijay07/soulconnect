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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const config_1 = require("@nestjs/config");
let PaymentsWebhookController = class PaymentsWebhookController {
    paymentsService;
    configService;
    constructor(paymentsService, configService) {
        this.paymentsService = paymentsService;
        this.configService = configService;
    }
    async handleStripeWebhook(sig, req) {
        const event = req.body;
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata.userId;
            const paymentId = session.metadata.paymentId;
            await this.paymentsService.verifyMockPayment(userId, paymentId);
        }
        return { received: true };
    }
    async handleRazorpayWebhook(sig, body) {
        if (body.event === 'payment.captured') {
            const payload = body.payload.payment.entity;
            const userId = payload.notes.userId;
            const paymentId = payload.notes.paymentId;
            await this.paymentsService.verifyMockPayment(userId, paymentId);
        }
        return { received: true };
    }
};
exports.PaymentsWebhookController = PaymentsWebhookController;
__decorate([
    (0, common_1.Post)('stripe'),
    (0, swagger_1.ApiOperation)({ summary: 'Stripe Webhook Handler' }),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsWebhookController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, common_1.Post)('razorpay'),
    (0, swagger_1.ApiOperation)({ summary: 'Razorpay Webhook Handler' }),
    __param(0, (0, common_1.Headers)('x-razorpay-signature')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsWebhookController.prototype, "handleRazorpayWebhook", null);
exports.PaymentsWebhookController = PaymentsWebhookController = __decorate([
    (0, swagger_1.ApiTags)('Payment Webhooks'),
    (0, common_1.Controller)('webhooks/payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        config_1.ConfigService])
], PaymentsWebhookController);
//# sourceMappingURL=payments.webhook.controller.js.map