import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingService } from './matching.service';
import { AdvancedMatchingService } from './advanced-matching.service';
import { MatchingController } from './matching.controller';
import { User } from '../users/entities/user.entity';
import { ListenerProfile } from '../listeners/entities/listener-profile.entity';
import { Interest } from '../users/entities/interest.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, ListenerProfile, Interest]),
    ],
    providers: [MatchingService, AdvancedMatchingService],
    controllers: [MatchingController],
    exports: [MatchingService, AdvancedMatchingService],
})
export class MatchingModule { }
