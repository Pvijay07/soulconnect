import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call, CallStatus, CallType, CallEndReason } from './entities/call.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionCategory } from '../wallet/entities/transaction.entity';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CallsService {
    constructor(
        @InjectRepository(Call)
        private readonly callRepo: Repository<Call>,
        @InjectRepository(ListenerProfile)
        private readonly lpRepo: Repository<ListenerProfile>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly walletService: WalletService,
    ) { }

    async initiateCall(callerId: string, calleeId: string, callType: CallType) {
        // 1. Get listener and caller info
        const lp = await this.lpRepo.findOne({ where: { userId: calleeId } });
        if (!lp || !lp.isAvailable) throw new BadRequestException('Listener not available');

        // Check if caller is 1st time user by checking their callCount
        // We need the userRepo which we will inject
        const caller = await this.userRepo.findOne({ where: { id: callerId } });
        if (!caller) throw new NotFoundException('Caller not found');

        let rate: number;

        // Logic: 1st call = 1₹, 2nd call = 2₹, 3rd call = 5₹
        // "Stars" get 7₹ (fixed for all calls if they are a star)
        // Check expertiseTags or some flag for Star
        const isStar = lp.expertiseTags?.includes('Star') || lp.expertiseTags?.includes('star');

        if (isStar) {
            rate = 7;
        } else {
            if (caller.callCount === 0) {
                rate = 1;
            } else if (caller.callCount === 1) {
                rate = 2;
            } else if (caller.callCount === 2) {
                rate = 5;
            } else {
                // Default to listener's rate or fixed 5 as per user request (logic extension)
                rate = callType === CallType.VIDEO ? Number(lp.videoRatePerMin) : Number(lp.voiceRatePerMin);
                // Based on "then 2, 5" I assume it stops at 5 or returns to normal. 
                // Let's stick to 5 as the "standard" after the intro phase if they wanted 1, 2, 5.
                if (caller.callCount >= 3 && rate < 5) rate = 5;
            }
        }

        // 2. Initial balance check (minimum 2 mins at the specialized rate)
        const wallet = await this.walletService.getWallet(callerId);
        if (wallet.balance < rate * 2) throw new BadRequestException(`Insufficient balance. This call rate is ₹${rate}/min.`);

        // 3. Create call record
        const call = this.callRepo.create({
            callerId,
            calleeId,
            callType,
            ratePerMin: rate,
            status: CallStatus.INITIATING,
        });
        await this.callRepo.save(call);

        lp.status = 'busy';
        await this.lpRepo.save(lp);

        return call;
    }

    async connectCall(callId: string) {
        const call = await this.callRepo.findOne({ where: { id: callId } });
        if (!call) throw new NotFoundException('Call not found');

        call.status = CallStatus.ACTIVE;
        call.connectedAt = new Date();
        call.startedAt = new Date();
        call.lastBilledAt = call.connectedAt;
        await this.callRepo.save(call);

        // Deduct first minute
        await this.walletService.debitWallet(
            call.callerId,
            Number(call.ratePerMin),
            TransactionCategory.CALL_DEBIT,
            call.id,
            `Initial minute for call ${call.id}`,
        );

        return call;
    }

    async endCall(callId: string, reason: CallEndReason) {
        const call = await this.callRepo.findOne({ where: { id: callId } });
        if (!call || call.status === CallStatus.ENDED) return;

        const endedAt = new Date();
        const durationSecs = Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000);
        const durationMins = Math.max(1, Math.ceil(durationSecs / 60));

        // Note: Wallet debit happened per-minute during the call.
        // We ensure call.totalBilled reflects the actual number of minutes charged.
        const totalBilled = durationMins * Number(call.ratePerMin);
        const commission = totalBilled * 0.3; // 30% commission
        const listenerEarned = totalBilled - commission;

        call.status = CallStatus.ENDED;
        call.endedAt = endedAt;
        call.durationSecs = durationSecs;
        call.totalBilled = totalBilled;
        call.commission = commission;
        call.listenerEarned = listenerEarned;
        call.endReason = reason;

        await this.callRepo.save(call);

        // Credit the listener at the end of the call
        await this.walletService.creditWallet(
            call.calleeId,
            listenerEarned,
            TransactionCategory.CALL_EARNING,
            call.id,
            `Call earnings: ${durationMins} mins`,
        );

        // Update listener stats
        await this.lpRepo.increment({ userId: call.calleeId }, 'totalCalls', 1);
        await this.lpRepo.increment({ userId: call.calleeId }, 'totalMinutes', durationMins);
        await this.lpRepo.increment({ userId: call.calleeId }, 'totalEarnings', listenerEarned);

        // Update caller call count
        await this.userRepo.increment({ id: call.callerId }, 'callCount', 1);

        const lp = await this.lpRepo.findOne({ where: { userId: call.calleeId } });
        if (lp) {
            lp.status = lp.isAvailable ? 'online' : 'offline';
            await this.lpRepo.save(lp);
        }

        return call;
    }
}
