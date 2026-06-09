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
exports.BlockedUser = exports.Report = exports.Rating = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let Rating = class Rating {
    id;
    callId;
    reviewerId;
    revieweeId;
    rating;
    reviewText;
    isVisible;
    createdAt;
    reviewer;
    reviewee;
};
exports.Rating = Rating;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Rating.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Rating.prototype, "callId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Rating.prototype, "reviewerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Rating.prototype, "revieweeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint' }),
    __metadata("design:type", Number)
], Rating.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Rating.prototype, "reviewText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Rating.prototype, "isVisible", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Rating.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'reviewerId' }),
    __metadata("design:type", user_entity_1.User)
], Rating.prototype, "reviewer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'revieweeId' }),
    __metadata("design:type", user_entity_1.User)
], Rating.prototype, "reviewee", void 0);
exports.Rating = Rating = __decorate([
    (0, typeorm_1.Entity)('ratings')
], Rating);
let Report = class Report {
    id;
    reporterId;
    reportedId;
    reason;
    description;
    evidenceUrls;
    status;
    adminNotes;
    resolvedBy;
    createdAt;
    resolvedAt;
    reporter;
    reported;
};
exports.Report = Report;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Report.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Report.prototype, "reporterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Report.prototype, "reportedId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], Report.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Report.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Report.prototype, "evidenceUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], Report.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Report.prototype, "adminNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Report.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Report.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Report.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'reporterId' }),
    __metadata("design:type", user_entity_1.User)
], Report.prototype, "reporter", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'reportedId' }),
    __metadata("design:type", user_entity_1.User)
], Report.prototype, "reported", void 0);
exports.Report = Report = __decorate([
    (0, typeorm_1.Entity)('reports')
], Report);
let BlockedUser = class BlockedUser {
    id;
    blockerId;
    blockedId;
    createdAt;
    blocker;
    blocked;
};
exports.BlockedUser = BlockedUser;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BlockedUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BlockedUser.prototype, "blockerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BlockedUser.prototype, "blockedId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], BlockedUser.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'blockerId' }),
    __metadata("design:type", user_entity_1.User)
], BlockedUser.prototype, "blocker", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'blockedId' }),
    __metadata("design:type", user_entity_1.User)
], BlockedUser.prototype, "blocked", void 0);
exports.BlockedUser = BlockedUser = __decorate([
    (0, typeorm_1.Entity)('blocked_users')
], BlockedUser);
//# sourceMappingURL=social.entity.js.map