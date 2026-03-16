import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralService } from './referral.service';
import { Referral } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Referral, User]),
        WalletModule,
    ],
    providers: [ReferralService],
    exports: [ReferralService],
})
export class ReferralModule { }
