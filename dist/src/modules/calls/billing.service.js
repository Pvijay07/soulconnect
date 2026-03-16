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
var CallBillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallBillingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const call_entity_1 = require("./entities/call.entity");
const wallet_service_1 = require("../wallet/wallet.service");
const transaction_entity_1 = require("../wallet/entities/transaction.entity");
const calls_gateway_1 = require("./gateways/calls.gateway");
const calls_service_1 = require("./calls.service");
let CallBillingService = CallBillingService_1 = class CallBillingService {
    callRepo;
    walletService;
    callsGateway;
    callsService;
    logger = new common_1.Logger(CallBillingService_1.name);
    interval;
    constructor(callRepo, walletService, callsGateway, callsService) {
        this.callRepo = callRepo;
        this.walletService = walletService;
        this.callsGateway = callsGateway;
        this.callsService = callsService;
    }
    onModuleInit() {
        this.interval = setInterval(() => this.processBilling(), 1000);
        this.logger.log('Billing Service initialized');
    }
    onModuleDestroy() {
        if (this.interval)
            clearInterval(this.interval);
    }
    async processBilling() {
        const activeCalls = await this.callRepo.find({
            where: { status: call_entity_1.CallStatus.ACTIVE },
        });
        const now = new Date();
        for (const call of activeCalls) {
            try {
                if (!call.lastBilledAt)
                    continue;
                const diffMs = now.getTime() - call.lastBilledAt.getTime();
                const diffSecs = Math.floor(diffMs / 1000);
                if (diffSecs < 1)
                    continue;
                const perSec = Number(call.ratePerMin) / 60.0;
                const wallet = await this.walletService.getWallet(call.callerId);
                const amountDue = perSec * diffSecs;
                if (Number(wallet.balance) < amountDue) {
                    const affordableSecs = Math.floor(Number(wallet.balance) / perSec);
                    if (affordableSecs > 0) {
                        const amt = perSec * affordableSecs;
                        await this.walletService.debitWallet(call.callerId, amt, transaction_entity_1.TransactionCategory.CALL_DEBIT, call.id, `Billing for ${affordableSecs} seconds of call ${call.id}`);
                        call.lastBilledAt = new Date(call.lastBilledAt.getTime() + affordableSecs * 1000);
                        await this.callRepo.save(call);
                    }
                    this.logger.log(`Ending call ${call.id} due to insufficient balance`);
                    this.callsGateway.server.to(`user_${call.callerId}`).emit('call:wallet_empty', { callId: call.id });
                    this.callsGateway.server.to(`user_${call.calleeId}`).emit('call:wallet_empty', { callId: call.id });
                    await this.callsService.endCall(call.id, call_entity_1.CallEndReason.BALANCE_EXHAUSTED);
                }
                else {
                    await this.walletService.debitWallet(call.callerId, amountDue, transaction_entity_1.TransactionCategory.CALL_DEBIT, call.id, `Billing for ${diffSecs} seconds of call ${call.id}`);
                    call.lastBilledAt = new Date(call.lastBilledAt.getTime() + diffSecs * 1000);
                    await this.callRepo.save(call);
                    this.logger.log(`Billed ${diffSecs}s for call ${call.id} amount ${amountDue}`);
                    this.callsGateway.server.to(`user_${call.callerId}`).emit('wallet:update', {
                        balance: Number((await this.walletService.getWallet(call.callerId)).balance),
                    });
                }
            }
            catch (error) {
                this.logger.error(`Error processing billing for call ${call.id}: ${error.message}`);
            }
        }
    }
};
exports.CallBillingService = CallBillingService;
exports.CallBillingService = CallBillingService = CallBillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(call_entity_1.Call)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => calls_service_1.CallsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        wallet_service_1.WalletService,
        calls_gateway_1.CallsGateway,
        calls_service_1.CallsService])
], CallBillingService);
//# sourceMappingURL=billing.service.js.map