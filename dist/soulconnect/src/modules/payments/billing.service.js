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
exports.PaymentBillingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./entities/invoice.entity");
const payment_entity_1 = require("./entities/payment.entity");
const user_entity_1 = require("../users/entities/user.entity");
let PaymentBillingService = class PaymentBillingService {
    invoiceRepo;
    paymentRepo;
    userRepo;
    constructor(invoiceRepo, paymentRepo, userRepo) {
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
        this.userRepo = userRepo;
    }
    async generateInvoice(paymentId) {
        const payment = await this.paymentRepo.findOne({
            where: { id: paymentId },
            relations: ['user']
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        const amount = Number(payment.amount);
        const gstRate = 18;
        const taxAmount = (amount * gstRate) / 100;
        const totalAmount = amount + taxAmount;
        const invoiceCount = await this.invoiceRepo.count();
        const invoiceNumber = `SC-INV-${new Date().getFullYear()}-${1000 + invoiceCount + 1}`;
        const invoice = this.invoiceRepo.create({
            invoiceNumber,
            userId: payment.userId,
            paymentId: payment.id,
            amount,
            taxRate: gstRate,
            taxAmount,
            totalAmount,
            currency: payment.currency,
            status: 'paid',
        });
        return await this.invoiceRepo.save(invoice);
    }
    async getUserInvoices(userId) {
        return this.invoiceRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getInvoicePdfData(invoiceId) {
        const invoice = await this.invoiceRepo.findOne({
            where: { id: invoiceId },
            relations: ['user', 'user.profile']
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return {
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.createdAt,
            customerName: invoice.user?.profile?.displayName,
            baseAmount: invoice.amount,
            gstAmount: invoice.taxAmount,
            total: invoice.totalAmount,
            platformGst: '29ABCDE1234F1Z5',
        };
    }
};
exports.PaymentBillingService = PaymentBillingService;
exports.PaymentBillingService = PaymentBillingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentBillingService);
//# sourceMappingURL=billing.service.js.map