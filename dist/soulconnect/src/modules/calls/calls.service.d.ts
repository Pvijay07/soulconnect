import { Repository } from 'typeorm';
import { Call, CallType, CallEndReason } from './entities/call.entity';
import { WalletService } from '../wallet/wallet.service';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { User } from '../users/entities/user.entity';
export declare class CallsService {
    private readonly callRepo;
    private readonly lpRepo;
    private readonly userRepo;
    private readonly walletService;
    constructor(callRepo: Repository<Call>, lpRepo: Repository<ListenerProfile>, userRepo: Repository<User>, walletService: WalletService);
    initiateCall(callerId: string, calleeId: string, callType: CallType): Promise<Call>;
    connectCall(callId: string): Promise<Call>;
    endCall(callId: string, reason: CallEndReason): Promise<Call | undefined>;
}
