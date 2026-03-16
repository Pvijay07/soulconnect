import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './gateways/chat.gateway';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { AuthModule } from '../auth/auth.module';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, Message]),
        AuthModule,
        ModerationModule,
    ],
    providers: [ChatService, ChatGateway],
    exports: [ChatService],
})
export class ChatModule { }
