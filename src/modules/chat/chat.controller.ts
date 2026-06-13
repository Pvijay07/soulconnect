import { Controller, Get, Post, UseGuards, Request, Param, Patch, Body, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('conversations')
    async getConversations(@Request() req, @Query('isSupport') isSupport?: string) {
        const userId = req.user.userId;
        const convs = await this.chatService.getConversations(userId, isSupport === 'true');
        return {
            status: 'success',
            data: convs,
        };
    }

    @Post('conversations')
    async getOrCreateConversation(@Request() req, @Body('recipientId') recipientId: string, @Body('isSupport') isSupport?: boolean) {
        const userId = req.user.userId;
        const conv = await this.chatService.findOrCreateConversation(userId, recipientId, isSupport);
        return {
            status: 'success',
            data: conv,
        };
    }

    @Get('conversations/:convId/messages')
    async getMessages(@Request() req, @Param('convId') convId: string) {
        const messages = await this.chatService.getMessages(convId);
        return {
            status: 'success',
            data: messages,
        };
    }

    @Patch('conversations/:convId/status')
    async updateStatus(@Request() req, @Param('convId') convId: string, @Body('status') status: string) {
        await this.chatService.updateConversationStatus(convId, status);
        return {
            status: 'success',
            message: 'Conversation status updated'
        };
    }
}
