import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallsService } from './calls.service';
import { MediaService } from './media.service';
import { CallsGateway } from './gateways/calls.gateway';
import { CallBillingService } from './billing.service';
import { CallsController } from './calls.controller';
import { Call, CallLog } from './entities/call.entity';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { User } from '../users/entities/user.entity';
import { WalletModule } from '../wallet/wallet.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Call, CallLog, ListenerProfile, User]),
        WalletModule,
        AuthModule,
        UsersModule,
    ],
    providers: [CallsService, MediaService, CallsGateway, CallBillingService],
    controllers: [CallsController],
    exports: [CallsService, MediaService, CallsGateway],
})
export class CallsModule { }
