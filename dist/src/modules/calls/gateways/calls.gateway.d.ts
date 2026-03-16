import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CallsService } from '../calls.service';
import { CallType } from '../entities/call.entity';
export declare class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    private readonly callsService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, callsService: CallsService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleInitiateCall(client: Socket, data: {
        calleeId: string;
        type: CallType;
        offer: any;
    }): Promise<{
        callId: string;
    }>;
    handleAcceptCall(client: Socket, data: {
        callId: string;
        answer: any;
    }): Promise<void>;
    handleRejectCall(client: Socket, data: {
        callId: string;
        callerId: string;
    }): Promise<void>;
    handleSignal(client: Socket, data: {
        recipientId: string;
        signal: any;
    }): void;
    handleEndCall(client: Socket, data: {
        callId: string;
        recipientId: string;
    }): Promise<void>;
}
