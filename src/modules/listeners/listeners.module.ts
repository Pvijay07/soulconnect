import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListenersService } from './listeners.service';
import { ListenersController } from './listeners.controller';
import { ListenerProfile } from './entities/listener-profile.entity';
import { User } from '../users/entities/user.entity';
import { Rating } from '../users/entities/social.entity';
import { Wallet } from '../wallet/entities/wallet.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ListenerProfile, User, Rating, Wallet])],
    providers: [ListenersService],
    controllers: [ListenersController],
    exports: [ListenersService],
})
export class ListenersModule { }
