import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Interest } from './entities/interest.entity';
import { Rating, Report, BlockedUser } from './entities/social.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Profile, Interest, Rating, Report, BlockedUser])],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule { }
