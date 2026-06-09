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
exports.Message = exports.MessageStatus = exports.MessageType = void 0;
const typeorm_1 = require("typeorm");
const conversation_entity_1 = require("./conversation.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["VOICE_NOTE"] = "voice_note";
    MessageType["SYSTEM"] = "system";
})(MessageType || (exports.MessageType = MessageType = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENT"] = "sent";
    MessageStatus["DELIVERED"] = "delivered";
    MessageStatus["READ"] = "read";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
let Message = class Message {
    id;
    conversationId;
    senderId;
    content;
    messageType;
    mediaUrl;
    mediaMetadata;
    status;
    isDeleted;
    expiresAt;
    createdAt;
    conversation;
    sender;
};
exports.Message = Message;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Message.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Message.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Message.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MessageType, default: MessageType.TEXT }),
    __metadata("design:type", String)
], Message.prototype, "messageType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "mediaUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Message.prototype, "mediaMetadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MessageStatus, default: MessageStatus.SENT }),
    __metadata("design:type", String)
], Message.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Message.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Message.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Message.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conversation_entity_1.Conversation),
    (0, typeorm_1.JoinColumn)({ name: 'conversationId' }),
    __metadata("design:type", conversation_entity_1.Conversation)
], Message.prototype, "conversation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'senderId' }),
    __metadata("design:type", user_entity_1.User)
], Message.prototype, "sender", void 0);
exports.Message = Message = __decorate([
    (0, typeorm_1.Entity)('messages')
], Message);
//# sourceMappingURL=message.entity.js.map