import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call, CallStatus } from './entities/call.entity';
import { MediaService } from './media.service';

@ApiTags('Calls')
@Controller('calls')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CallsController {
    constructor(
        @InjectRepository(Call)
        private readonly callRepo: Repository<Call>,
        private readonly mediaService: MediaService,
    ) { }

    @Get('history')
    @ApiOperation({ summary: 'Get call history for current user' })
    async getHistory(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
        const userId = req.user.sub;
        const [items, total] = await this.callRepo.findAndCount({
            where: [
                { callerId: userId, status: CallStatus.ENDED },
                { calleeId: userId, status: CallStatus.ENDED },
                { callerId: userId, status: CallStatus.MISSED },
                { calleeId: userId, status: CallStatus.MISSED },
            ],
            relations: ['caller', 'caller.profile', 'callee', 'callee.profile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: +limit,
        });

        const history = items.map(call => {
            const isCaller = call.callerId === userId;
            const otherUser = isCaller ? call.callee : call.caller;
            return {
                id: call.id,
                otherUserId: otherUser?.id,
                otherUserName: otherUser?.profile?.displayName || 'Unknown',
                otherUserAvatar: otherUser?.profile?.avatarUrl,
                type: call.callType,
                durationSecs: call.durationSecs,
                duration: call.durationSecs
                    ? `${Math.floor(call.durationSecs / 60)}m ${call.durationSecs % 60}s`
                    : '0m 0s',
                cost: call.totalBilled,
                ratePerMin: call.ratePerMin,
                date: call.createdAt,
                status: call.status,
                isIncoming: !isCaller,
            };
        });

        return { data: { history, total, hasNext: +page * +limit < total } };
    }

    @Post('token')
    @ApiOperation({ summary: 'Generate Twilio access token for WebRTC call' })
    async getCallToken(
        @Req() req: any,
        @Body() body: { roomName: string },
    ) {
        const userId = req.user.sub;
        const room = await this.mediaService.createRoom(body.roomName);
        const token = this.mediaService.generateAccessToken(userId, body.roomName);
        return { data: { token, roomSid: room.sid, roomName: body.roomName } };
    }
}
