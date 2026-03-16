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
import { ChatService } from '../chat.service';
import { ModerationService } from '../../moderation/moderation.service';
import { MessageType } from '../entities/message.entity';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Track connected users: userId -> socketId
    private connectedUsers = new Map<string, string>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly chatService: ChatService,
        private readonly moderationService: ModerationService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret'),
            });

            const userId = payload.sub;
            client.data.userId = userId;
            this.connectedUsers.set(userId, client.id);

            console.log(`User connected: ${userId}`);
            client.join(`user_${userId}`);
        } catch (e) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            this.connectedUsers.delete(userId);
            console.log(`User disconnected: ${userId}`);
        }
    }

    @SubscribeMessage('message:send')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { recipientId: string; content: string; type?: MessageType },
    ) {
        const senderId = client.data.userId;
        const { recipientId, content, type } = data;

        // AI MODERATION CHECK
        const modResult = await this.moderationService.checkContent(content);
        if (modResult.isFlagged) {
            await this.moderationService.flagUserForReview(senderId, 'TOXIC_CONTENT', content);
            return { status: 'error', reason: 'Content flagged by AI moderation' };
        }

        const conv = await this.chatService.findOrCreateConversation(senderId, recipientId);
        const message = await this.chatService.saveMessage(conv.id, senderId, content, type);

        // Emit to both users
        this.server.to(`user_${senderId}`).emit('message:new', message);
        this.server.to(`user_${recipientId}`).emit('message:new', message);

        return { status: 'ok', messageId: message.id };
    }

    @SubscribeMessage('typing:status')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { recipientId: string; isTyping: boolean },
    ) {
        const senderId = client.data.userId;
        this.server.to(`user_${data.recipientId}`).emit('typing:update', {
            senderId,
            isTyping: data.isTyping,
        });
    }
}
