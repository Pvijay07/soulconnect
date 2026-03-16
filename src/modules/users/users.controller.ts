import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Put('me')
    @ApiOperation({ summary: 'Update current user profile' })
    async updateProfile(@Req() req: any, @Body() dto: any) {
        return { data: await this.usersService.updateProfile(req.user.sub, dto) };
    }

    @Get(':id/public')
    @ApiOperation({ summary: 'Get public profile' })
    async getPublicProfile(@Param('id') id: string) {
        return { data: await this.usersService.getPublicProfile(id) };
    }

    @Get('interests')
    @ApiOperation({ summary: 'Get all interests' })
    async getInterests() {
        return { data: await this.usersService.getAllInterests() };
    }

    @Get(':id/ratings')
    @ApiOperation({ summary: 'Get user ratings' })
    async getRatings(@Param('id') id: string, @Query('page') page = 1, @Query('limit') limit = 20) {
        return { data: await this.usersService.getUserRatings(id, +page, +limit) };
    }

    @Post(':id/rate')
    @ApiOperation({ summary: 'Rate a user after call' })
    async rateUser(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
        return { data: await this.usersService.rateUser(req.user.sub, id, dto.callId, dto.rating, dto.reviewText) };
    }

    @Post(':id/report')
    @ApiOperation({ summary: 'Report a user' })
    async reportUser(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
        return { data: await this.usersService.reportUser(req.user.sub, id, dto.reason, dto.description) };
    }

    @Post(':id/block')
    @ApiOperation({ summary: 'Block a user' })
    async blockUser(@Req() req: any, @Param('id') id: string) {
        return { data: await this.usersService.blockUser(req.user.sub, id) };
    }

    @Delete(':id/block')
    @ApiOperation({ summary: 'Unblock a user' })
    async unblockUser(@Req() req: any, @Param('id') id: string) {
        return { data: await this.usersService.unblockUser(req.user.sub, id) };
    }

    @Get('blocked')
    @ApiOperation({ summary: 'Get blocked users list' })
    async getBlockedUsers(@Req() req: any) {
        return { data: await this.usersService.getBlockedUsers(req.user.sub) };
    }
}
