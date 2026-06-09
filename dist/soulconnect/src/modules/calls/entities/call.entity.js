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
exports.CallLog = exports.Call = exports.CallEndReason = exports.CallStatus = exports.CallType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var CallType;
(function (CallType) {
    CallType["VOICE"] = "voice";
    CallType["VIDEO"] = "video";
})(CallType || (exports.CallType = CallType = {}));
var CallStatus;
(function (CallStatus) {
    CallStatus["INITIATING"] = "initiating";
    CallStatus["RINGING"] = "ringing";
    CallStatus["CONNECTED"] = "connected";
    CallStatus["ACTIVE"] = "active";
    CallStatus["RECONNECTING"] = "reconnecting";
    CallStatus["ENDED"] = "ended";
    CallStatus["FAILED"] = "failed";
    CallStatus["MISSED"] = "missed";
})(CallStatus || (exports.CallStatus = CallStatus = {}));
var CallEndReason;
(function (CallEndReason) {
    CallEndReason["USER_HANGUP"] = "user_hangup";
    CallEndReason["LISTENER_HANGUP"] = "listener_hangup";
    CallEndReason["BALANCE_EXHAUSTED"] = "balance_exhausted";
    CallEndReason["NETWORK_DROP"] = "network_drop";
    CallEndReason["ERROR"] = "error";
    CallEndReason["TIMEOUT"] = "timeout";
})(CallEndReason || (exports.CallEndReason = CallEndReason = {}));
let Call = class Call {
    id;
    callerId;
    calleeId;
    callType;
    status;
    ratePerMin;
    durationSecs;
    totalBilled;
    commission;
    listenerEarned;
    endReason;
    qualityScore;
    startedAt;
    connectedAt;
    lastBilledAt;
    endedAt;
    createdAt;
    caller;
    callee;
    logs;
};
exports.Call = Call;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Call.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Call.prototype, "callerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Call.prototype, "calleeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CallType }),
    __metadata("design:type", String)
], Call.prototype, "callType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CallStatus, default: CallStatus.INITIATING }),
    __metadata("design:type", String)
], Call.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Call.prototype, "ratePerMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Call.prototype, "durationSecs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Call.prototype, "totalBilled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Call.prototype, "commission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Call.prototype, "listenerEarned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CallEndReason, nullable: true }),
    __metadata("design:type", String)
], Call.prototype, "endReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Call.prototype, "qualityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Call.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Call.prototype, "connectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Call.prototype, "lastBilledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Call.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Call.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'callerId' }),
    __metadata("design:type", user_entity_1.User)
], Call.prototype, "caller", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'calleeId' }),
    __metadata("design:type", user_entity_1.User)
], Call.prototype, "callee", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CallLog, (log) => log.call),
    __metadata("design:type", Array)
], Call.prototype, "logs", void 0);
exports.Call = Call = __decorate([
    (0, typeorm_1.Entity)('calls')
], Call);
let CallLog = class CallLog {
    id;
    callId;
    eventType;
    eventData;
    createdAt;
    call;
};
exports.CallLog = CallLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CallLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CallLog.prototype, "callId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], CallLog.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CallLog.prototype, "eventData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CallLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Call, (call) => call.logs),
    (0, typeorm_1.JoinColumn)({ name: 'callId' }),
    __metadata("design:type", Call)
], CallLog.prototype, "call", void 0);
exports.CallLog = CallLog = __decorate([
    (0, typeorm_1.Entity)('call_logs')
], CallLog);
//# sourceMappingURL=call.entity.js.map