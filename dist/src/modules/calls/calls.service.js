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
exports.CallsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const call_entity_1 = require("./entities/call.entity");
const wallet_service_1 = require("../wallet/wallet.service");
const transaction_entity_1 = require("../wallet/entities/transaction.entity");
const listener_profile_entity_1 = require("../listeners/entities/listener-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
let CallsService = class CallsService {
    callRepo;
    lpRepo;
    userRepo;
    walletService;
    constructor(callRepo, lpRepo, userRepo, walletService) {
        this.callRepo = callRepo;
        this.lpRepo = lpRepo;
        this.userRepo = userRepo;
        this.walletService = walletService;
    }
    async initiateCall(callerId, calleeId, callType) {
        const lp = await this.lpRepo.findOne({ where: { userId: calleeId } });
        if (!lp || !lp.isAvailable)
            throw new common_1.BadRequestException('Listener not available');
        const caller = await this.userRepo.findOne({ where: { id: callerId } });
        if (!caller)
            throw new common_1.NotFoundException('Caller not found');
        let rate;
        const isStar = lp.expertiseTags?.includes('Star') || lp.expertiseTags?.includes('star');
        if (isStar) {
            rate = 7;
        }
        else {
            if (caller.callCount === 0) {
                rate = 1;
            }
            else if (caller.callCount === 1) {
                rate = 2;
            }
            else if (caller.callCount === 2) {
                rate = 5;
            }
            else {
                rate = callType === call_entity_1.CallType.VIDEO ? Number(lp.videoRatePerMin) : Number(lp.voiceRatePerMin);
                if (caller.callCount >= 3 && rate < 5)
                    rate = 5;
            }
        }
        const wallet = await this.walletService.getWallet(callerId);
        if (wallet.balance < rate * 2)
            throw new common_1.BadRequestException(`Insufficient balance. This call rate is ₹${rate}/min.`);
        const call = this.callRepo.create({
            callerId,
            calleeId,
            callType,
            ratePerMin: rate,
            status: call_entity_1.CallStatus.INITIATING,
        });
        await this.callRepo.save(call);
        lp.status = 'busy';
        await this.lpRepo.save(lp);
        return call;
    }
    async connectCall(callId) {
        const call = await this.callRepo.findOne({ where: { id: callId } });
        if (!call)
            throw new common_1.NotFoundException('Call not found');
        call.status = call_entity_1.CallStatus.ACTIVE;
        call.connectedAt = new Date();
        call.startedAt = new Date();
        call.lastBilledAt = call.connectedAt;
        await this.callRepo.save(call);
        await this.walletService.debitWallet(call.callerId, Number(call.ratePerMin), transaction_entity_1.TransactionCategory.CALL_DEBIT, call.id, `Initial minute for call ${call.id}`);
        return call;
    }
    async endCall(callId, reason) {
        const call = await this.callRepo.findOne({ where: { id: callId } });
        if (!call || call.status === call_entity_1.CallStatus.ENDED)
            return;
        const endedAt = new Date();
        const durationSecs = Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000);
        const durationMins = Math.max(1, Math.ceil(durationSecs / 60));
        const totalBilled = durationMins * Number(call.ratePerMin);
        const commission = totalBilled * 0.3;
        const listenerEarned = totalBilled - commission;
        call.status = call_entity_1.CallStatus.ENDED;
        call.endedAt = endedAt;
        call.durationSecs = durationSecs;
        call.totalBilled = totalBilled;
        call.commission = commission;
        call.listenerEarned = listenerEarned;
        call.endReason = reason;
        await this.callRepo.save(call);
        await this.walletService.creditWallet(call.calleeId, listenerEarned, transaction_entity_1.TransactionCategory.CALL_EARNING, call.id, `Call earnings: ${durationMins} mins`);
        await this.lpRepo.increment({ userId: call.calleeId }, 'totalCalls', 1);
        await this.lpRepo.increment({ userId: call.calleeId }, 'totalMinutes', durationMins);
        await this.lpRepo.increment({ userId: call.calleeId }, 'totalEarnings', listenerEarned);
        await this.userRepo.increment({ id: call.callerId }, 'callCount', 1);
        const lp = await this.lpRepo.findOne({ where: { userId: call.calleeId } });
        if (lp) {
            lp.status = lp.isAvailable ? 'online' : 'offline';
            await this.lpRepo.save(lp);
        }
        return call;
    }
};
exports.CallsService = CallsService;
exports.CallsService = CallsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(call_entity_1.Call)),
    __param(1, (0, typeorm_1.InjectRepository)(listener_profile_entity_1.ListenerProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        wallet_service_1.WalletService])
], CallsService);
//# sourceMappingURL=calls.service.js.map