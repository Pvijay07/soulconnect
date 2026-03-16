import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Banner } from './entities/banner.entity';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { User } from '../users/entities/user.entity';
import { Call } from '../calls/entities/call.entity';
import { Transaction } from '../wallet/entities/transaction.entity';
import { ListenersModule } from '../listeners/listeners.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Banner, ListenerProfile, User, Call, Transaction]),
        ListenersModule,
        AuthModule,
    ],
    providers: [AdminService],
    controllers: [AdminController],
    exports: [AdminService],
})
export class AdminModule { }
