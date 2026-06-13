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
import { WalletService } from '../../wallet/wallet.service';
import { TransactionCategory } from '../../wallet/entities/transaction.entity';

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
        private readonly walletService: WalletService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret'),
            });

            const userId = payload.sub;
            client.data.userId = userId;
            client.data.role = payload.role;
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
        @MessageBody() data: { recipientId: string; content?: string; type?: MessageType; mediaUrl?: string },
    ) {
        const senderId = client.data.userId;
        const senderRole = client.data.role;
        const { recipientId, content, type, mediaUrl } = data;

        // AI MODERATION CHECK (skip for media unless we add OCR/Audio transcription later)
        if (content) {
            const modResult = await this.moderationService.checkContent(content);
            if (modResult.isFlagged) {
                await this.moderationService.flagUserForReview(senderId, 'TOXIC_CONTENT', content);
                return { status: 'error', reason: 'Content flagged by AI moderation' };
            }
        }

        const conv = await this.chatService.findOrCreateConversation(senderId, recipientId);

        // Deduct 3 coins from user and credit to expert
        if (senderRole === 'user') {
            try {
                await this.walletService.debitWallet(senderId, 3, TransactionCategory.CHAT_DEBIT, conv.id, 'Chat message cost');
                await this.walletService.creditWallet(recipientId, 3, TransactionCategory.CHAT_EARNING, conv.id, 'Chat message earning');
            } catch (e) {
                return { status: 'error', reason: 'Insufficient balance. Please recharge your wallet.' };
            }
        }

        const message = await this.chatService.saveMessage(conv.id, senderId, content, type, mediaUrl);

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
