import { Controller, Get, UseGuards, Request, Param, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('conversations')
    async getConversations(@Request() req) {
        const userId = req.user.userId;
        const convs = await this.chatService.getConversations(userId);
        return {
            status: 'success',
            data: convs,
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
