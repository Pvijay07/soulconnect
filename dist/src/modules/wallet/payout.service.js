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
exports.PayoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payout_entity_1 = require("./entities/payout.entity");
const wallet_service_1 = require("./wallet.service");
const wallet_entity_1 = require("./entities/wallet.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
let PayoutService = class PayoutService {
    payoutRepo;
    walletRepo;
    walletService;
    dataSource;
    constructor(payoutRepo, walletRepo, walletService, dataSource) {
        this.payoutRepo = payoutRepo;
        this.walletRepo = walletRepo;
        this.walletService = walletService;
        this.dataSource = dataSource;
    }
    async requestPayout(userId, amount, bankDetails) {
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet || Number(wallet.balance) < amount) {
            throw new common_1.BadRequestException('Insufficient balance for payout');
        }
        if (amount < 500) {
            throw new common_1.BadRequestException('Minimum payout amount is ₹500');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const payout = this.payoutRepo.create({
                listenerId: userId,
                amount,
                bankDetails,
                status: 'pending',
            });
            await queryRunner.manager.save(payout);
            await this.walletService.debitWallet(userId, amount, transaction_entity_1.TransactionCategory.WITHDRAWAL, payout.id, 'Payout request initiated');
            await queryRunner.commitTransaction();
            return payout;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getPayoutsForListener(userId) {
        return this.payoutRepo.find({
            where: { listenerId: userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getAllPayouts(status) {
        const where = status ? { status: status } : {};
        return this.payoutRepo.find({
            where,
            relations: ['listener', 'listener.profile'],
            order: { createdAt: 'DESC' },
        });
    }
    async updatePayoutStatus(payoutId, status, remarks, reference) {
        const payout = await this.payoutRepo.findOne({ where: { id: payoutId } });
        if (!payout)
            throw new common_1.NotFoundException('Payout request not found');
        payout.status = status;
        payout.remarks = remarks || payout.remarks;
        payout.transactionReference = reference || payout.transactionReference;
        if (status === 'failed') {
            await this.walletService.creditWallet(payout.listenerId, Number(payout.amount), transaction_entity_1.TransactionCategory.REFUND, payout.id, 'Payout refund due to failure');
        }
        return await this.payoutRepo.save(payout);
    }
};
exports.PayoutService = PayoutService;
exports.PayoutService = PayoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payout_entity_1.Payout)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        wallet_service_1.WalletService,
        typeorm_2.DataSource])
], PayoutService);
//# sourceMappingURL=payout.service.js.map