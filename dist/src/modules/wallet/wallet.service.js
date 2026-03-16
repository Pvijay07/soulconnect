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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("./entities/wallet.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
let WalletService = class WalletService {
    walletRepo;
    transactionRepo;
    dataSource;
    constructor(walletRepo, transactionRepo, dataSource) {
        this.walletRepo = walletRepo;
        this.transactionRepo = transactionRepo;
        this.dataSource = dataSource;
    }
    async getWallet(userId) {
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        return wallet;
    }
    async getTransactions(userId, page = 1, limit = 20) {
        const [transactions, total] = await this.transactionRepo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { transactions, total, page, limit, hasNext: page * limit < total };
    }
    async creditWallet(userId, amount, category, referenceId, description) {
        return await this.dataSource.transaction(async (manager) => {
            const wallet = await manager.findOne(wallet_entity_1.Wallet, { where: { userId }, lock: { mode: 'pessimistic_write' } });
            if (!wallet)
                throw new common_1.NotFoundException('Wallet not found');
            const balanceBefore = Number(wallet.balance);
            wallet.balance = balanceBefore + amount;
            await manager.save(wallet);
            const transaction = manager.create(transaction_entity_1.Transaction, {
                walletId: wallet.id,
                userId,
                type: transaction_entity_1.TransactionType.CREDIT,
                category,
                amount,
                balanceAfter: wallet.balance,
                referenceId,
                description,
            });
            await manager.save(transaction);
            return wallet;
        });
    }
    async debitWallet(userId, amount, category, referenceId, description) {
        return await this.dataSource.transaction(async (manager) => {
            const wallet = await manager.findOne(wallet_entity_1.Wallet, { where: { userId }, lock: { mode: 'pessimistic_write' } });
            if (!wallet)
                throw new common_1.NotFoundException('Wallet not found');
            const balanceBefore = Number(wallet.balance);
            if (balanceBefore < amount)
                throw new common_1.BadRequestException('Insufficient balance');
            wallet.balance = balanceBefore - amount;
            await manager.save(wallet);
            const transaction = manager.create(transaction_entity_1.Transaction, {
                walletId: wallet.id,
                userId,
                type: transaction_entity_1.TransactionType.DEBIT,
                category,
                amount,
                balanceAfter: wallet.balance,
                referenceId,
                description,
            });
            await manager.save(transaction);
            return wallet;
        });
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], WalletService);
//# sourceMappingURL=wallet.service.js.map