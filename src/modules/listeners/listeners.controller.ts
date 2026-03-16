import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { ListenersService } from './listeners.service';

@ApiTags('Listeners')
@Controller('listeners')
export class ListenersController {
    constructor(private readonly listenersService: ListenersService) { }

    @Post('apply')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Apply to become a listener' })
    async apply(@Req() req: any, @Body() dto: any) {
        return { data: await this.listenersService.apply(req.user.sub, dto) };
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Browse available listeners' })
    async browse(
        @Query('category') category?: string,
        @Query('language') language?: string,
        @Query('min_rating') minRating?: number,
        @Query('max_rate') maxRate?: number,
        @Query('sort') sort?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return { data: await this.listenersService.browse({ category, language, minRating, maxRate, sort, page, limit }) };
    }

    @Get('me/earnings')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get listener earnings dashboard' })
    async getEarnings(@Req() req: any) {
        return { data: await this.listenersService.getEarnings(req.user.sub) };
    }

    @Put('me/availability')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle availability' })
    async toggleAvailability(@Req() req: any, @Body('isAvailable') isAvailable: boolean) {
        return { data: await this.listenersService.toggleAvailability(req.user.sub, isAvailable) };
    }

    @Put('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update listener profile' })
    async updateProfile(@Req() req: any, @Body() dto: any) {
        return { data: await this.listenersService.updateProfile(req.user.sub, dto) };
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get listener detail' })
    async getDetail(@Param('id') id: string) {
        return { data: await this.listenersService.getDetail(id) };
    }

    @Post(':id/rate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit rating for a listener' })
    async submitRating(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: { callId: string, rating: number, reviewText?: string }
    ) {
        return { data: await this.listenersService.submitRating(req.user.sub, id, dto.callId, dto.rating, dto.reviewText) };
    }

    // Admin Endpoints
    @Get('admin/pending')
    @UseGuards(JwtAuthGuard) // In production, add AdminGuard
    @ApiBearerAuth()
    async getPending(@Query('page') page?: number, @Query('limit') limit?: number) {
        return { data: await this.listenersService.getAdminPending(page, limit) };
    }

    @Post('admin/:id/approve')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async approve(@Param('id') id: string) {
        return { data: await this.listenersService.approveListener(id) };
    }

    @Post('admin/:id/reject')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async reject(@Param('id') id: string, @Body('reason') reason: string) {
        return { data: await this.listenersService.rejectListener(id, reason) };
    }
}
