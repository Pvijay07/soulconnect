import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationService } from './moderation.service';
import { Report } from '../users/entities/social.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Report])],
    providers: [ModerationService],
    exports: [ModerationService],
})
export class ModerationModule { }
