"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const call_entity_1 = require("../calls/entities/call.entity");
const transaction_entity_1 = require("../wallet/entities/transaction.entity");
let AnalyticsService = class AnalyticsService {
    userRepo;
    callRepo;
    transRepo;
    constructor(userRepo, callRepo, transRepo) {
        this.userRepo = userRepo;
        this.callRepo = callRepo;
        this.transRepo = transRepo;
    }
    async calculateLTV() {
        const totalRevenue = await this.transRepo.createQueryBuilder('t')
            .where('t.type = :type', { type: 'recharge' })
            .select('SUM(t.amount)', 'total')
            .getRawOne();
        const totalUsers = await this.userRepo.count();
        return {
            totalRevenue: Number(totalRevenue.total || 0),
            avgLTV: totalUsers > 0 ? Number(totalRevenue.total || 0) / totalUsers : 0,
        };
    }
    async getChurnRate() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = await this.userRepo.createQueryBuilder('u')
            .where('u.updatedAt > :date', { date: thirtyDaysAgo })
            .getCount();
        const totalUsers = await this.userRepo.count();
        const lostUsers = totalUsers - activeUsers;
        return {
            churnRate: totalUsers > 0 ? (lostUsers / totalUsers) * 100 : 0,
            activeUsers,
            totalUsers,
        };
    }
    async getRevenueStats() {
        return this.transRepo.createQueryBuilder('t')
            .select("DATE_TRUNC('day', t.createdAt)", 'date')
            .addSelect('SUM(t.amount)', 'amount')
            .where('t.type = :type', { type: 'recharge' })
            .groupBy('date')
            .orderBy('date', 'ASC')
            .getRawMany();
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(call_entity_1.CallLog)),
    __param(2, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map