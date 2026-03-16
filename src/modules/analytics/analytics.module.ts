import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { User } from '../users/entities/user.entity';
import { CallLog } from '../calls/entities/call.entity';
import { Transaction } from '../wallet/entities/transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, CallLog, Transaction]),
    ],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
