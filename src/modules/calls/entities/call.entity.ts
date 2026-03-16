import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CallType {
    VOICE = 'voice',
    VIDEO = 'video',
}

export enum CallStatus {
    INITIATING = 'initiating',
    RINGING = 'ringing',
    CONNECTED = 'connected',
    ACTIVE = 'active',
    RECONNECTING = 'reconnecting',
    ENDED = 'ended',
    FAILED = 'failed',
    MISSED = 'missed',
}

export enum CallEndReason {
    USER_HANGUP = 'user_hangup',
    LISTENER_HANGUP = 'listener_hangup',
    BALANCE_EXHAUSTED = 'balance_exhausted',
    NETWORK_DROP = 'network_drop',
    ERROR = 'error',
    TIMEOUT = 'timeout',
}

@Entity('calls')
export class Call {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    callerId: string;

    @Column({ type: 'uuid' })
    calleeId: string;

    @Column({ type: 'enum', enum: CallType })
    callType: CallType;

    @Column({ type: 'enum', enum: CallStatus, default: CallStatus.INITIATING })
    status: CallStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    ratePerMin: number;

    @Column({ type: 'int', default: 0 })
    durationSecs: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalBilled: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    commission: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    listenerEarned: number;

    @Column({ type: 'enum', enum: CallEndReason, nullable: true })
    endReason: CallEndReason;

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
    qualityScore: number;

    @Column({ type: 'timestamptz', nullable: true })
    startedAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    connectedAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    lastBilledAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    endedAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'callerId' })
    caller: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'calleeId' })
    callee: User;

    @OneToMany(() => CallLog, (log) => log.call)
    logs: CallLog[];
}

@Entity('call_logs')
export class CallLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    callId: string;

    @Column({ type: 'varchar', length: 30 })
    eventType: string;

    @Column({ type: 'jsonb', nullable: true })
    eventData: Record<string, any>;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => Call, (call) => call.logs)
    @JoinColumn({ name: 'callId' })
    call: Call;
}
