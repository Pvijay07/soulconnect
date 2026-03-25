import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call, CallStatus, CallEndReason } from './entities/call.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionCategory } from '../wallet/entities/transaction.entity';
import { CallsGateway } from './gateways/calls.gateway';
import { CallsService } from './calls.service';

@Injectable()
export class CallBillingService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(CallBillingService.name);
    private interval: NodeJS.Timeout;

    constructor(
        @InjectRepository(Call)
        private readonly callRepo: Repository<Call>,
        private readonly walletService: WalletService,
        private readonly callsGateway: CallsGateway,
        @Inject(forwardRef(() => CallsService))
        private readonly callsService: CallsService,
    ) { }

    onModuleInit() {
        // Tick every second to support per-second billing
        this.interval = setInterval(() => this.processBilling(), 1000);
        this.logger.log('Billing Service initialized');
    }

    onModuleDestroy() {
        if (this.interval) clearInterval(this.interval);
    }

    private async processBilling() {
        // Find all active calls
        const activeCalls = await this.callRepo.find({
            where: { status: CallStatus.ACTIVE },
        });

        const now = new Date();

        for (const call of activeCalls) {
            try {
                if (!call.startedAt) continue;

                const durationSecs = Math.floor((now.getTime() - call.startedAt.getTime()) / 1000);
                const perSec = Number(call.ratePerMin) / 60.0;
                const costSoFar = durationSecs * perSec;

                const wallet = await this.walletService.getWallet(call.callerId);

                // If running cost exhausts balance, end call
                if (Number(wallet.balance) <= costSoFar) {
                    this.logger.log(`Ending call ${call.id} due to insufficient balance`);
                    
                    this.callsGateway.server.to(`user_${call.callerId}`).emit('call:wallet_empty', { callId: call.id });
                    this.callsGateway.server.to(`user_${call.calleeId}`).emit('call:wallet_empty', { callId: call.id });

                    // End call via CallsService (this will perform the final exact deduction)
                    await this.callsService.endCall(call.id, CallEndReason.BALANCE_EXHAUSTED);
                } else {
                    // Update remaining balance virtually if frontend supports it, but skip heavy DB writes.
                    const approxRemaining = Math.max(0, Number(wallet.balance) - costSoFar);
                    if (durationSecs % 5 === 0) { // Emit every 5 seconds to reduce socket load
                        this.callsGateway.server.to(`user_${call.callerId}`).emit('wallet:update', {
                            balance: approxRemaining,
                        });
                    }
                }
            } catch (error) {
                this.logger.error(`Error processing billing for call ${call.id}: ${error.message}`);
            }
        }
    }
}
