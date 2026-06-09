"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const listeners_service_1 = require("./listeners.service");
const listeners_controller_1 = require("./listeners.controller");
const listener_profile_entity_1 = require("./entities/listener-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const social_entity_1 = require("../users/entities/social.entity");
const wallet_entity_1 = require("../wallet/entities/wallet.entity");
let ListenersModule = class ListenersModule {
};
exports.ListenersModule = ListenersModule;
exports.ListenersModule = ListenersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([listener_profile_entity_1.ListenerProfile, user_entity_1.User, social_entity_1.Rating, wallet_entity_1.Wallet])],
        providers: [listeners_service_1.ListenersService],
        controllers: [listeners_controller_1.ListenersController],
        exports: [listeners_service_1.ListenersService],
    })
], ListenersModule);
//# sourceMappingURL=listeners.module.js.map