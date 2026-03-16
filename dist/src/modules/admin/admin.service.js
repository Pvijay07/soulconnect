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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const banner_entity_1 = require("./entities/banner.entity");
const listener_profile_entity_1 = require("../listeners/entities/listener-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const call_entity_1 = require("../calls/entities/call.entity");
const transaction_entity_1 = require("../wallet/entities/transaction.entity");
let AdminService = class AdminService {
    bannerRepo;
    listenerRepo;
    userRepo;
    callRepo;
    txnRepo;
    constructor(bannerRepo, listenerRepo, userRepo, callRepo, txnRepo) {
        this.bannerRepo = bannerRepo;
        this.listenerRepo = listenerRepo;
        this.userRepo = userRepo;
        this.callRepo = callRepo;
        this.txnRepo = txnRepo;
    }
    async getActiveBanners() {
        const now = new Date();
        return this.bannerRepo.find({
            where: {
                isActive: true,
            },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }
    async getAllBanners() {
        return this.bannerRepo.find({
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }
    async createBanner(data) {
        const banner = this.bannerRepo.create(data);
        return this.bannerRepo.save(banner);
    }
    async updateBanner(id, data) {
        const banner = await this.bannerRepo.findOne({ where: { id } });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        Object.assign(banner, data);
        return this.bannerRepo.save(banner);
    }
    async deleteBanner(id) {
        const result = await this.bannerRepo.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Banner not found');
        return { deleted: true };
    }
    async getDashboardStats() {
        const totalUsers = await this.userRepo.count();
        const totalListeners = await this.listenerRepo.count({ where: { isApproved: true } });
        const pendingApprovals = await this.listenerRepo.count({ where: { approvalStatus: 'pending' } });
        const totalCalls = await this.callRepo.count();
        const activeBanners = await this.bannerRepo.count({ where: { isActive: true } });
        const revenueResult = await this.txnRepo
            .createQueryBuilder('t')
            .select('COALESCE(SUM(t.amount), 0)', 'total')
            .where("t.category = 'call_debit'")
            .getRawOne();
        return {
            totalUsers,
            totalListeners,
            pendingApprovals,
            totalCalls,
            activeBanners,
            totalRevenue: parseFloat(revenueResult?.total || '0'),
        };
    }
    async getPendingExperts(page = 1, limit = 20) {
        const [items, total] = await this.listenerRepo.findAndCount({
            where: { approvalStatus: 'pending' },
            relations: ['user', 'user.profile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, hasNext: page * limit < total };
    }
    async getAllExperts(page = 1, limit = 20) {
        const [items, total] = await this.listenerRepo.findAndCount({
            relations: ['user', 'user.profile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, hasNext: page * limit < total };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(banner_entity_1.Banner)),
    __param(1, (0, typeorm_1.InjectRepository)(listener_profile_entity_1.ListenerProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(call_entity_1.Call)),
    __param(4, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map