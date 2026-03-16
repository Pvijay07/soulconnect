import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import configuration from './config/configuration';

// Entities
import { User } from './modules/users/entities/user.entity';
import { Profile } from './modules/users/entities/profile.entity';
import { Interest } from './modules/users/entities/interest.entity';
import { Rating, Report, BlockedUser } from './modules/users/entities/social.entity';
import { ListenerProfile } from './modules/listeners/entities/listener-profile.entity';
import { Conversation } from './modules/chat/entities/conversation.entity';
import { Message } from './modules/chat/entities/message.entity';
import { Call, CallLog } from './modules/calls/entities/call.entity';
import { Wallet } from './modules/wallet/entities/wallet.entity';
import { Transaction } from './modules/wallet/entities/transaction.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Notification, Device } from './modules/notifications/entities/notification.entity';
import { Banner } from './modules/admin/entities/banner.entity';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ListenersModule } from './modules/listeners/listeners.module';
import { ChatModule } from './modules/chat/chat.module';
import { CallsModule } from './modules/calls/calls.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MatchingModule } from './modules/matching/matching.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReferralModule } from './modules/referral/referral.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CRMModule } from './modules/crm/crm.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        entities: [
          User, Profile, Interest, Rating, Report, BlockedUser,
          ListenerProfile, Conversation, Message, Call, CallLog,
          Wallet, Transaction, Payment, Notification, Device,
          Banner,
        ],
        synchronize: true, // Only for development
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ListenersModule,
    ChatModule,
    CallsModule,
    WalletModule,
    PaymentsModule,
    MatchingModule,
    ModerationModule,
    NotificationsModule,
    ReferralModule,
    AnalyticsModule,
    CRMModule,
    AdminModule,
  ],
})
export class AppModule { }
