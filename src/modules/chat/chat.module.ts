import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './gateways/chat.gateway';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { ModerationModule } from '../moderation/moderation.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, Message]),
        AuthModule,
        ModerationModule,
        WalletModule,
    ],
    providers: [ChatService, ChatGateway],
    controllers: [ChatController],
    exports: [ChatService, ChatGateway],
})
export class ChatModule { }
