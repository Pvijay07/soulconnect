import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { PayoutService } from './payout.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { Payout } from './entities/payout.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Wallet, Transaction, Payout, User]),
    ],
    providers: [WalletService, PayoutService],
    controllers: [WalletController],
    exports: [WalletService, PayoutService],
})
export class WalletModule { }
