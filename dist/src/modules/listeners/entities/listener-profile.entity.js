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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let ListenerProfile = class ListenerProfile {
    id;
    userId;
    headline;
    description;
    expertiseTags;
    languages;
    voiceRatePerMin;
    videoRatePerMin;
    chatRatePerMin;
    isAvailable;
    status;
    isVerified;
    isApproved;
    approvalStatus;
    totalCalls;
    totalMinutes;
    avgRating;
    totalRatings;
    totalEarnings;
    createdAt;
    identityDocUrl;
    certificateUrl;
    introVideoUrl;
    rejectionReason;
    gender;
    age;
    updatedAt;
    user;
};
exports.ListenerProfile = ListenerProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ListenerProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ListenerProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], ListenerProfile.prototype, "headline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ListenerProfile.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', default: '' }),
    __metadata("design:type", Array)
], ListenerProfile.prototype, "expertiseTags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', default: 'en' }),
    __metadata("design:type", Array)
], ListenerProfile.prototype, "languages", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ListenerProfile.prototype, "voiceRatePerMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ListenerProfile.prototype, "videoRatePerMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ListenerProfile.prototype, "chatRatePerMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ListenerProfile.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'offline' }),
    __metadata("design:type", String)
], ListenerProfile.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ListenerProfile.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ListenerProfile.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], ListenerProfile.prototype, "approvalStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ListenerProfile.prototype, "totalCalls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ListenerProfile.prototype, "totalMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ListenerProfile.prototype, "avgRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ListenerProfile.prototype, "totalRatings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ListenerProfile.prototype, "totalEarnings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ListenerProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ListenerProfile.prototype, "identityDocUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ListenerProfile.prototype, "certificateUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ListenerProfile.prototype, "introVideoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], ListenerProfile.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], ListenerProfile.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ListenerProfile.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ListenerProfile.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.listenerProfile, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], ListenerProfile.prototype, "user", void 0);
exports.ListenerProfile = ListenerProfile = __decorate([
    (0, typeorm_1.Entity)('listener_profiles')
], ListenerProfile);
//# sourceMappingURL=listener-profile.entity.js.map