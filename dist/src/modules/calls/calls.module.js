"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const calls_service_1 = require("./calls.service");
const media_service_1 = require("./media.service");
const calls_gateway_1 = require("./gateways/calls.gateway");
const billing_service_1 = require("./billing.service");
const calls_controller_1 = require("./calls.controller");
const call_entity_1 = require("./entities/call.entity");
const listener_profile_entity_1 = require("../listeners/entities/listener-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const wallet_module_1 = require("../wallet/wallet.module");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
let CallsModule = class CallsModule {
};
exports.CallsModule = CallsModule;
exports.CallsModule = CallsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([call_entity_1.Call, call_entity_1.CallLog, listener_profile_entity_1.ListenerProfile, user_entity_1.User]),
            wallet_module_1.WalletModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
        ],
        providers: [calls_service_1.CallsService, media_service_1.MediaService, calls_gateway_1.CallsGateway, billing_service_1.CallBillingService],
        controllers: [calls_controller_1.CallsController],
        exports: [calls_service_1.CallsService, media_service_1.MediaService, calls_gateway_1.CallsGateway],
    })
], CallsModule);
//# sourceMappingURL=calls.module.js.map