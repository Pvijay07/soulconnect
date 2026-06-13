import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../chat.service';
import { ModerationService } from '../../moderation/moderation.service';
import { MessageType } from '../entities/message.entity';
import { WalletService } from '../../wallet/wallet.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    private readonly chatService;
    private readonly moderationService;
    private readonly walletService;
    server: Server;
    private connectedUsers;
    constructor(jwtService: JwtService, configService: ConfigService, chatService: ChatService, moderationService: ModerationService, walletService: WalletService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleMessage(client: Socket, data: {
        recipientId: string;
        content?: string;
        type?: MessageType;
        mediaUrl?: string;
    }): Promise<{
        status: string;
        reason: string;
        messageId?: undefined;
    } | {
        status: string;
        messageId: string;
        reason?: undefined;
    }>;
    handleTyping(client: Socket, data: {
        recipientId: string;
        isTyping: boolean;
    }): void;
}
