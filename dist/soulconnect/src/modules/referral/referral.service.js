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
exports.ReferralService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const referral_entity_1 = require("./entities/referral.entity");
const user_entity_1 = require("../users/entities/user.entity");
const wallet_service_1 = require("../wallet/wallet.service");
const transaction_entity_1 = require("../wallet/entities/transaction.entity");
let ReferralService = class ReferralService {
    referralRepo;
    userRepo;
    walletService;
    constructor(referralRepo, userRepo, walletService) {
        this.referralRepo = referralRepo;
        this.userRepo = userRepo;
        this.walletService = walletService;
    }
    async generateReferralCode(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (!user.referralCode) {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            user.referralCode = code;
            await this.userRepo.save(user);
        }
        return user.referralCode;
    }
    async processReferral(referralCode, newUserId) {
        const referrer = await this.userRepo.findOne({ where: { referralCode } });
        if (!referrer)
            return;
        const referral = this.referralRepo.create({
            referrerId: referrer.id,
            referredId: newUserId,
            status: 'pending',
        });
        await this.referralRepo.save(referral);
    }
    async rewardReferrer(referredId) {
        const referral = await this.referralRepo.findOne({
            where: { referredId, status: 'pending' }
        });
        if (referral) {
            const reward = 50;
            await this.walletService.creditWallet(referral.referrerId, reward, transaction_entity_1.TransactionCategory.BONUS, referral.id, 'Referral bonus');
            referral.status = 'rewarded';
            referral.rewardAmount = reward;
            await this.referralRepo.save(referral);
        }
    }
};
exports.ReferralService = ReferralService;
exports.ReferralService = ReferralService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(referral_entity_1.Referral)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        wallet_service_1.WalletService])
], ReferralService);
//# sourceMappingURL=referral.service.js.map