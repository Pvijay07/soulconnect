import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../chat.service';
import { ModerationService } from '../../moderation/moderation.service';
import { MessageType } from '../entities/message.entity';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly configService;
    private readonly chatService;
    private readonly moderationService;
    server: Server;
    private connectedUsers;
    constructor(jwtService: JwtService, configService: ConfigService, chatService: ChatService, moderationService: ModerationService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleMessage(client: Socket, data: {
        recipientId: string;
        content: string;
        type?: MessageType;
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
