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
exports.CallsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const calls_service_1 = require("../calls.service");
const call_entity_1 = require("../entities/call.entity");
const common_1 = require("@nestjs/common");
let CallsGateway = class CallsGateway {
    jwtService;
    configService;
    callsService;
    server;
    logger = new common_1.Logger('CallsGateway');
    constructor(jwtService, configService, callsService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.callsService = callsService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            this.logger.log(`Connection attempt with token: ${token?.substring(0, 10)}...`);
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret'),
            });
            client.data.userId = payload.sub;
            client.join(`user_${payload.sub}`);
            this.logger.log(`User connected to calls gateway: ${payload.sub}`);
        }
        catch (e) {
            this.logger.error(`Error connecting to calls gateway: ${e.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) { }
    async handleInitiateCall(client, data) {
        const callerId = client.data.userId;
        const call = await this.callsService.initiateCall(callerId, data.calleeId, data.type);
        this.server.to(`user_${data.calleeId}`).emit('call:incoming', {
            callId: call.id,
            callerId,
            type: data.type,
            offer: data.offer,
        });
        return { callId: call.id };
    }
    async handleAcceptCall(client, data) {
        const call = await this.callsService.connectCall(data.callId);
        this.server.to(`user_${call.callerId}`).emit('call:accepted', {
            callId: call.id,
            answer: data.answer,
        });
    }
    async handleRejectCall(client, data) {
        await this.callsService.endCall(data.callId, call_entity_1.CallEndReason.TIMEOUT);
        this.server.to(`user_${data.callerId}`).emit('call:rejected', { callId: data.callId });
    }
    handleSignal(client, data) {
        this.server.to(`user_${data.recipientId}`).emit('call:signal', {
            senderId: client.data.userId,
            signal: data.signal,
        });
    }
    async handleEndCall(client, data) {
        await this.callsService.endCall(data.callId, call_entity_1.CallEndReason.USER_HANGUP);
        this.server.to(`user_${data.recipientId}`).emit('call:ended', { callId: data.callId });
    }
};
exports.CallsGateway = CallsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CallsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:initiate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleInitiateCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:accept'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleAcceptCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:reject'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleRejectCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:signal'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CallsGateway.prototype, "handleSignal", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:end'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleEndCall", null);
exports.CallsGateway = CallsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: 'calls',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        calls_service_1.CallsService])
], CallsGateway);
//# sourceMappingURL=calls.gateway.js.map