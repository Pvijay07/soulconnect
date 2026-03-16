import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, Device } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Notification, Device])],
    providers: [NotificationsService],
    controllers: [NotificationsController],
    exports: [NotificationsService],
})
export class NotificationsModule { }
