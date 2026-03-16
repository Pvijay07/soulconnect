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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const transaction_entity_1 = require("./entities/transaction.entity");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
const wallet_service_1 = require("./wallet.service");
const payout_service_1 = require("./payout.service");
let WalletController = class WalletController {
    walletService;
    payoutService;
    constructor(walletService, payoutService) {
        this.walletService = walletService;
        this.payoutService = payoutService;
    }
    async getWallet(req) {
        return { data: await this.walletService.getWallet(req.user.sub) };
    }
    async getTransactions(req, page = 1, limit = 20) {
        return { data: await this.walletService.getTransactions(req.user.sub, +page, +limit) };
    }
    async recharge(req, amount) {
        return { data: await this.walletService.creditWallet(req.user.sub, amount, transaction_entity_1.TransactionCategory.RECHARGE, undefined, 'Wallet Recharge') };
    }
    async requestPayout(req, dto) {
        return { data: await this.payoutService.requestPayout(req.user.sub, dto.amount, dto.bankDetails) };
    }
    async getPayouts(req) {
        return { data: await this.payoutService.getPayoutsForListener(req.user.sub) };
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user wallet balance' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('recharge'),
    (0, swagger_1.ApiOperation)({ summary: 'Simulate wallet recharge' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "recharge", null);
__decorate([
    (0, common_1.Post)('payout/request'),
    (0, swagger_1.ApiOperation)({ summary: 'Request a payout' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "requestPayout", null);
__decorate([
    (0, common_1.Get)('payouts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payout history' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getPayouts", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallet'),
    (0, common_1.Controller)('wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        payout_service_1.PayoutService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map