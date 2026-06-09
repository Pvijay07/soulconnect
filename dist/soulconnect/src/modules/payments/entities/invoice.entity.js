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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const payment_entity_1 = require("../../payments/entities/payment.entity");
let Invoice = class Invoice {
    id;
    invoiceNumber;
    user;
    userId;
    payment;
    paymentId;
    amount;
    taxRate;
    taxAmount;
    totalAmount;
    currency;
    billingAddress;
    gstNumber;
    status;
    createdAt;
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Invoice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Invoice.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invoice.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => payment_entity_1.Payment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'paymentId' }),
    __metadata("design:type", payment_entity_1.Payment)
], Invoice.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "taxRate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "taxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'INR' }),
    __metadata("design:type", String)
], Invoice.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "billingAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "gstNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'paid' }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "createdAt", void 0);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)('invoices')
], Invoice);
//# sourceMappingURL=invoice.entity.js.map