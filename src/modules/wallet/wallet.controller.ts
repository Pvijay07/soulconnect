import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { TransactionCategory } from './entities/transaction.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { PayoutService } from './payout.service';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
    constructor(
        private readonly walletService: WalletService,
        private readonly payoutService: PayoutService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get current user wallet balance' })
    async getWallet(@Req() req: any) {
        return { data: await this.walletService.getWallet(req.user.sub) };
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Get transaction history' })
    async getTransactions(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
        return { data: await this.walletService.getTransactions(req.user.sub, +page, +limit) };
    }

    @Post('recharge')
    @ApiOperation({ summary: 'Simulate wallet recharge' })
    async recharge(@Req() req: any, @Body('amount') amount: number) {
        return { data: await this.walletService.creditWallet(req.user.sub, amount, TransactionCategory.RECHARGE, undefined, 'Wallet Recharge') };
    }

    @Post('payout/request')
    @ApiOperation({ summary: 'Request a payout' })
    async requestPayout(@Req() req: any, @Body() dto: { amount: number, bankDetails: any }) {
        return { data: await this.payoutService.requestPayout(req.user.sub, dto.amount, dto.bankDetails) };
    }

    @Get('payouts')
    @ApiOperation({ summary: 'Get payout history' })
    async getPayouts(@Req() req: any) {
        return { data: await this.payoutService.getPayoutsForListener(req.user.sub) };
    }
}
