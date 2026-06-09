"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_service_1 = require("./admin.service");
const admin_controller_1 = require("./admin.controller");
const banner_entity_1 = require("./entities/banner.entity");
const listener_profile_entity_1 = require("../listeners/entities/listener-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const call_entity_1 = require("../calls/entities/call.entity");
const transaction_entity_1 = require("../wallet/entities/transaction.entity");
const listeners_module_1 = require("../listeners/listeners.module");
const auth_module_1 = require("../auth/auth.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([banner_entity_1.Banner, listener_profile_entity_1.ListenerProfile, user_entity_1.User, call_entity_1.Call, transaction_entity_1.Transaction]),
            listeners_module_1.ListenersModule,
            auth_module_1.AuthModule,
        ],
        providers: [admin_service_1.AdminService],
        controllers: [admin_controller_1.AdminController],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map