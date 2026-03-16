import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentBillingService } from './billing.service';
import { PaymentsController } from './payments.controller';
import { PaymentsWebhookController } from './payments.webhook.controller';
import { Payment } from './entities/payment.entity';
import { Invoice } from './entities/invoice.entity';
import { WalletModule } from '../wallet/wallet.module';
import { User } from '../users/entities/user.entity';
import { CallsModule } from '../calls/calls.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Payment, Invoice, User]),
        WalletModule,
        CallsModule,
    ],
    providers: [PaymentsService, PaymentBillingService],
    controllers: [PaymentsController, PaymentsWebhookController],
    exports: [PaymentsService, PaymentBillingService],
})
export class PaymentsModule { }
