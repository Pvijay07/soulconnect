import { User } from '../../users/entities/user.entity';
export declare enum CallType {
    VOICE = "voice",
    VIDEO = "video"
}
export declare enum CallStatus {
    INITIATING = "initiating",
    RINGING = "ringing",
    CONNECTED = "connected",
    ACTIVE = "active",
    RECONNECTING = "reconnecting",
    ENDED = "ended",
    FAILED = "failed",
    MISSED = "missed"
}
export declare enum CallEndReason {
    USER_HANGUP = "user_hangup",
    LISTENER_HANGUP = "listener_hangup",
    BALANCE_EXHAUSTED = "balance_exhausted",
    NETWORK_DROP = "network_drop",
    ERROR = "error",
    TIMEOUT = "timeout"
}
export declare class Call {
    id: string;
    callerId: string;
    calleeId: string;
    callType: CallType;
    status: CallStatus;
    ratePerMin: number;
    durationSecs: number;
    totalBilled: number;
    commission: number;
    listenerEarned: number;
    endReason: CallEndReason;
    qualityScore: number;
    startedAt: Date;
    connectedAt: Date;
    lastBilledAt: Date;
    endedAt: Date;
    createdAt: Date;
    caller: User;
    callee: User;
    logs: CallLog[];
}
export declare class CallLog {
    id: string;
    callId: string;
    eventType: string;
    eventData: Record<string, any>;
    createdAt: Date;
    call: Call;
}
