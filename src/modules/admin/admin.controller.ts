import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { AdminService } from './admin.service';
import { ListenersService } from '../listeners/listeners.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly listenersService: ListenersService,
    ) { }

    // ─── Users ────────────────────────────────────────────────

    @Get('users')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users (admin)' })
    async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string) {
        return { data: await this.adminService.getAllUsers(+page, +limit, search) };
    }

    // ─── Dashboard ──────────────────────────────────────────────

    @Get('dashboard')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get admin dashboard stats' })
    async getDashboard() {
        return { data: await this.adminService.getDashboardStats() };
    }

    // ─── Banners ────────────────────────────────────────────────

    @Get('banners')
    @ApiOperation({ summary: 'Get active banners (public)' })
    async getActiveBanners() {
        return { data: await this.adminService.getActiveBanners() };
    }

    @Get('banners/all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all banners (admin)' })
    async getAllBanners() {
        return { data: await this.adminService.getAllBanners() };
    }

    @Post('banners')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new banner' })
    async createBanner(@Body() dto: any) {
        return { data: await this.adminService.createBanner(dto) };
    }

    @Put('banners/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a banner' })
    async updateBanner(@Param('id') id: string, @Body() dto: any) {
        return { data: await this.adminService.updateBanner(id, dto) };
    }

    @Delete('banners/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a banner' })
    async deleteBanner(@Param('id') id: string) {
        return { data: await this.adminService.deleteBanner(id) };
    }

    // ─── Expert Verification ────────────────────────────────────

    @Get('experts/pending')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get pending expert applications' })
    async getPendingExperts(@Query('page') page = 1, @Query('limit') limit = 20) {
        return { data: await this.adminService.getPendingExperts(+page, +limit) };
    }

    @Get('experts/all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all experts' })
    async getAllExperts(@Query('page') page = 1, @Query('limit') limit = 20) {
        return { data: await this.adminService.getAllExperts(+page, +limit) };
    }

    @Post('experts/:id/approve')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Approve an expert application' })
    async approveExpert(@Param('id') id: string) {
        return { data: await this.listenersService.approveListener(id) };
    }

    @Post('experts/:id/reject')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reject an expert application' })
    async rejectExpert(@Param('id') id: string, @Body('reason') reason: string) {
        return { data: await this.listenersService.rejectListener(id, reason || 'Application rejected by admin') };
    }
}
