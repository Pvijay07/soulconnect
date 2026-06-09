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
exports.CallsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/strategies/jwt-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const call_entity_1 = require("./entities/call.entity");
const media_service_1 = require("./media.service");
let CallsController = class CallsController {
    callRepo;
    mediaService;
    constructor(callRepo, mediaService) {
        this.callRepo = callRepo;
        this.mediaService = mediaService;
    }
    async getHistory(req, page = 1, limit = 20) {
        const userId = req.user.sub;
        const [items, total] = await this.callRepo.findAndCount({
            where: [
                { callerId: userId, status: call_entity_1.CallStatus.ENDED },
                { calleeId: userId, status: call_entity_1.CallStatus.ENDED },
                { callerId: userId, status: call_entity_1.CallStatus.MISSED },
                { calleeId: userId, status: call_entity_1.CallStatus.MISSED },
            ],
            relations: ['caller', 'caller.profile', 'callee', 'callee.profile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: +limit,
        });
        const history = items.map(call => {
            const isCaller = call.callerId === userId;
            const otherUser = isCaller ? call.callee : call.caller;
            return {
                id: call.id,
                otherUserId: otherUser?.id,
                otherUserName: otherUser?.profile?.displayName || 'Unknown',
                otherUserAvatar: otherUser?.profile?.avatarUrl,
                type: call.callType,
                durationSecs: call.durationSecs,
                duration: call.durationSecs
                    ? `${Math.floor(call.durationSecs / 60)}m ${call.durationSecs % 60}s`
                    : '0m 0s',
                cost: call.totalBilled,
                ratePerMin: call.ratePerMin,
                date: call.createdAt,
                status: call.status,
                isIncoming: !isCaller,
            };
        });
        return { data: { history, total, hasNext: +page * +limit < total } };
    }
    async getCallToken(req, body) {
        const userId = req.user.sub;
        const room = await this.mediaService.createRoom(body.roomName);
        const token = this.mediaService.generateAccessToken(userId, body.roomName);
        return { data: { token, roomSid: room.sid, roomName: body.roomName } };
    }
};
exports.CallsController = CallsController;
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get call history for current user' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('token'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate Twilio access token for WebRTC call' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getCallToken", null);
exports.CallsController = CallsController = __decorate([
    (0, swagger_1.ApiTags)('Calls'),
    (0, common_1.Controller)('calls'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, typeorm_1.InjectRepository)(call_entity_1.Call)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        media_service_1.MediaService])
], CallsController);
//# sourceMappingURL=calls.controller.js.map