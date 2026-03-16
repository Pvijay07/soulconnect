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
                if (!call.lastBilledAt) continue;

                const diffMs = now.getTime() - call.lastBilledAt.getTime();
                const diffSecs = Math.floor(diffMs / 1000);
                if (diffSecs < 1) continue;

                const perSec = Number(call.ratePerMin) / 60.0;
                const wallet = await this.walletService.getWallet(call.callerId);

                const amountDue = perSec * diffSecs;

                if (Number(wallet.balance) < amountDue) {
                    // calculate affordable seconds
                    const affordableSecs = Math.floor(Number(wallet.balance) / perSec);
                    if (affordableSecs > 0) {
                        const amt = perSec * affordableSecs;
                        await this.walletService.debitWallet(
                            call.callerId,
                            amt,
                            TransactionCategory.CALL_DEBIT,
                            call.id,
                            `Billing for ${affordableSecs} seconds of call ${call.id}`,
                        );
                        // advance lastBilledAt by affordableSecs
                        call.lastBilledAt = new Date(call.lastBilledAt.getTime() + affordableSecs * 1000);
                        await this.callRepo.save(call);
                    }

                    this.logger.log(`Ending call ${call.id} due to insufficient balance`);
                    // Inform participants
                    this.callsGateway.server.to(`user_${call.callerId}`).emit('call:wallet_empty', { callId: call.id });
                    this.callsGateway.server.to(`user_${call.calleeId}`).emit('call:wallet_empty', { callId: call.id });

                    // End call via CallsService to finalize records and credit listener
                    await this.callsService.endCall(call.id, CallEndReason.BALANCE_EXHAUSTED);
                } else {
                    // Debit full amountDue
                    await this.walletService.debitWallet(
                        call.callerId,
                        amountDue,
                        TransactionCategory.CALL_DEBIT,
                        call.id,
                        `Billing for ${diffSecs} seconds of call ${call.id}`,
                    );

                    // advance lastBilledAt
                    call.lastBilledAt = new Date(call.lastBilledAt.getTime() + diffSecs * 1000);
                    await this.callRepo.save(call);

                    this.logger.log(`Billed ${diffSecs}s for call ${call.id} amount ${amountDue}`);

                    // Inform user of new balance
                    this.callsGateway.server.to(`user_${call.callerId}`).emit('wallet:update', {
                        balance: Number((await this.walletService.getWallet(call.callerId)).balance),
                    });
                }
            } catch (error) {
                this.logger.error(`Error processing billing for call ${call.id}: ${error.message}`);
            }
        }
    }
}
