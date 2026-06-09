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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const wallet_service_1 = require("../wallet/wallet.service");
const transaction_entity_1 = require("../wallet/entities/transaction.entity");
const calls_gateway_1 = require("../calls/gateways/calls.gateway");
let PaymentsService = class PaymentsService {
    paymentRepo;
    walletService;
    callsGateway;
    constructor(paymentRepo, walletService, callsGateway) {
        this.paymentRepo = paymentRepo;
        this.walletService = walletService;
        this.callsGateway = callsGateway;
    }
    async createRechargeIntent(userId, amount, gateway) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Invalid amount');
        const payment = this.paymentRepo.create({
            userId,
            amount,
            gateway,
            status: 'pending',
        });
        await this.paymentRepo.save(payment);
        const orderId = `order_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        return {
            id: orderId,
            paymentId: payment.id,
            amount: amount * 100,
            amount_inr: amount,
            currency: 'INR',
            status: 'created',
            gateway,
        };
    }
    async verifyMockPayment(userId, paymentId) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId, userId } });
        if (!payment)
            throw new common_1.BadRequestException('Payment not found');
        if (payment.status !== 'pending')
            return payment;
        payment.status = 'completed';
        payment.gatewayTxnId = `txn_${Math.random().toString(36).substr(2, 9)}`;
        await this.paymentRepo.save(payment);
        const wallet = await this.walletService.creditWallet(userId, Number(payment.amount), transaction_entity_1.TransactionCategory.RECHARGE, payment.id, `Recharge via ${payment.gateway}`);
        try {
            this.callsGateway.server.to(`user_${userId}`).emit('wallet:update', { balance: Number(wallet.balance) });
        }
        catch (e) {
        }
        return payment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        wallet_service_1.WalletService,
        calls_gateway_1.CallsGateway])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map