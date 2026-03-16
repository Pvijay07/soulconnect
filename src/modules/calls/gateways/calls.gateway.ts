import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CallsService } from '../calls.service';
import { CallType, CallEndReason } from '../entities/call.entity';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'calls',
})
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger('CallsGateway');

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly callsService: CallsService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            this.logger.log(`Connection attempt with token: ${token?.substring(0, 10)}...`);
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret'),
            });
            client.data.userId = payload.sub;
            client.join(`user_${payload.sub}`);
            this.logger.log(`User connected to calls gateway: ${payload.sub}`);
        } catch (e) {
            this.logger.error(`Error connecting to calls gateway: ${e.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) { }

    @SubscribeMessage('call:initiate')
    async handleInitiateCall(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { calleeId: string; type: CallType; offer: any },
    ) {
        const callerId = client.data.userId;
        const call = await this.callsService.initiateCall(callerId, data.calleeId, data.type);

        this.server.to(`user_${data.calleeId}`).emit('call:incoming', {
            callId: call.id,
            callerId,
            type: data.type,
            offer: data.offer,
        });

        return { callId: call.id };
    }

    @SubscribeMessage('call:accept')
    async handleAcceptCall(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { callId: string; answer: any },
    ) {
        const call = await this.callsService.connectCall(data.callId);
        this.server.to(`user_${call.callerId}`).emit('call:accepted', {
            callId: call.id,
            answer: data.answer,
        });
    }

    @SubscribeMessage('call:reject')
    async handleRejectCall(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { callId: string; callerId: string },
    ) {
        await this.callsService.endCall(data.callId, CallEndReason.TIMEOUT);
        this.server.to(`user_${data.callerId}`).emit('call:rejected', { callId: data.callId });
    }

    @SubscribeMessage('call:signal')
    handleSignal(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { recipientId: string; signal: any },
    ) {
        this.server.to(`user_${data.recipientId}`).emit('call:signal', {
            senderId: client.data.userId,
            signal: data.signal,
        });
    }

    @SubscribeMessage('call:end')
    async handleEndCall(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { callId: string; recipientId: string },
    ) {
        await this.callsService.endCall(data.callId, CallEndReason.USER_HANGUP);
        this.server.to(`user_${data.recipientId}`).emit('call:ended', { callId: data.callId });
    }
}
