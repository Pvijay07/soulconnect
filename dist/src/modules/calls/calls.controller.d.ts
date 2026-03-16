import { Repository } from 'typeorm';
import { Call, CallStatus } from './entities/call.entity';
import { MediaService } from './media.service';
export declare class CallsController {
    private readonly callRepo;
    private readonly mediaService;
    constructor(callRepo: Repository<Call>, mediaService: MediaService);
    getHistory(req: any, page?: number, limit?: number): Promise<{
        data: {
            history: {
                id: string;
                otherUserId: string;
                otherUserName: any;
                otherUserAvatar: any;
                type: import("./entities/call.entity").CallType;
                durationSecs: number;
                duration: string;
                cost: number;
                ratePerMin: number;
                date: Date;
                status: CallStatus;
                isIncoming: boolean;
            }[];
            total: number;
            hasNext: boolean;
        };
    }>;
    getCallToken(req: any, body: {
        roomName: string;
    }): Promise<{
        data: {
            token: string;
            roomSid: string;
            roomName: string;
        };
    }>;
}
