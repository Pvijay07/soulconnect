"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const configuration_1 = __importDefault(require("./config/configuration"));
const user_entity_1 = require("./modules/users/entities/user.entity");
const profile_entity_1 = require("./modules/users/entities/profile.entity");
const interest_entity_1 = require("./modules/users/entities/interest.entity");
const social_entity_1 = require("./modules/users/entities/social.entity");
const listener_profile_entity_1 = require("./modules/listeners/entities/listener-profile.entity");
const conversation_entity_1 = require("./modules/chat/entities/conversation.entity");
const message_entity_1 = require("./modules/chat/entities/message.entity");
const call_entity_1 = require("./modules/calls/entities/call.entity");
const wallet_entity_1 = require("./modules/wallet/entities/wallet.entity");
const transaction_entity_1 = require("./modules/wallet/entities/transaction.entity");
const payment_entity_1 = require("./modules/payments/entities/payment.entity");
const notification_entity_1 = require("./modules/notifications/entities/notification.entity");
const banner_entity_1 = require("./modules/admin/entities/banner.entity");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const listeners_module_1 = require("./modules/listeners/listeners.module");
const chat_module_1 = require("./modules/chat/chat.module");
const calls_module_1 = require("./modules/calls/calls.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const payments_module_1 = require("./modules/payments/payments.module");
const matching_module_1 = require("./modules/matching/matching.module");
const moderation_module_1 = require("./modules/moderation/moderation.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const referral_module_1 = require("./modules/referral/referral.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const crm_module_1 = require("./modules/crm/crm.module");
const admin_module_1 = require("./modules/admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                load: [configuration_1.default],
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('database.host'),
                    port: config.get('database.port'),
                    username: config.get('database.username'),
                    password: config.get('database.password'),
                    database: config.get('database.name'),
                    entities: [
                        user_entity_1.User, profile_entity_1.Profile, interest_entity_1.Interest, social_entity_1.Rating, social_entity_1.Report, social_entity_1.BlockedUser,
                        listener_profile_entity_1.ListenerProfile, conversation_entity_1.Conversation, message_entity_1.Message, call_entity_1.Call, call_entity_1.CallLog,
                        wallet_entity_1.Wallet, transaction_entity_1.Transaction, payment_entity_1.Payment, notification_entity_1.Notification, notification_entity_1.Device,
                        banner_entity_1.Banner,
                    ],
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            listeners_module_1.ListenersModule,
            chat_module_1.ChatModule,
            calls_module_1.CallsModule,
            wallet_module_1.WalletModule,
            payments_module_1.PaymentsModule,
            matching_module_1.MatchingModule,
            moderation_module_1.ModerationModule,
            notifications_module_1.NotificationsModule,
            referral_module_1.ReferralModule,
            analytics_module_1.AnalyticsModule,
            crm_module_1.CRMModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map