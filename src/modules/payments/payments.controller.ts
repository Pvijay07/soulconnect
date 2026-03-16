import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('recharge')
    @ApiOperation({ summary: 'Create a recharge intent' })
    async recharge(@Req() req: any, @Body() dto: { amount: number; gateway: string }) {
        return { data: await this.paymentsService.createRechargeIntent(req.user.sub, dto.amount, dto.gateway) };
    }

    @Post('verify-mock')
    @ApiOperation({ summary: 'Mock verify payment (DEV ONLY)' })
    async verifyMock(@Req() req: any, @Body() dto: { paymentId: string }) {
        return { data: await this.paymentsService.verifyMockPayment(req.user.sub, dto.paymentId) };
    }
}
