import { Controller, Get, Post, Body, Put, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('devices/register')
    @ApiOperation({ summary: 'Register a device for push notifications' })
    async registerDevice(@Req() req: any, @Body() dto: { token: string; platform: string; deviceInfo?: any }) {
        return { data: await this.notificationsService.registerDevice(req.user.sub, dto.token, dto.platform, dto.deviceInfo) };
    }

    @Get()
    @ApiOperation({ summary: 'Get notification history' })
    async getNotifications(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
        return { data: await this.notificationsService.getNotifications(req.user.sub, +page, +limit) };
    }

    @Put(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    async markAsRead(@Param('id') id: string) {
        return { data: await this.notificationsService.markAsRead(id) };
    }
}
