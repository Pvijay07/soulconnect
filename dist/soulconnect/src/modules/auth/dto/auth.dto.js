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
exports.AppleAuthDto = exports.GoogleAuthDto = exports.RefreshTokenDto = exports.VerifyOtpDto = exports.SendOtpDto = exports.LoginDto = exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RegisterDto {
    email;
    phone;
    password;
    displayName;
    isAnonymous;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+919876543210' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SecureP@ss123', minLength: 6 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Anonymous User' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "isAnonymous", void 0);
class LoginDto {
    email;
    phone;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+919876543210' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LoginDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SecureP@ss123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class SendOtpDto {
    phone;
    purpose;
}
exports.SendOtpDto = SendOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendOtpDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'login', default: 'login' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendOtpDto.prototype, "purpose", void 0);
class VerifyOtpDto {
    phone;
    otp;
}
exports.VerifyOtpDto = VerifyOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "otp", void 0);
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class GoogleAuthDto {
    idToken;
}
exports.GoogleAuthDto = GoogleAuthDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "idToken", void 0);
class AppleAuthDto {
    identityToken;
    fullName;
}
exports.AppleAuthDto = AppleAuthDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppleAuthDto.prototype, "identityToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AppleAuthDto.prototype, "fullName", void 0);
//# sourceMappingURL=auth.dto.js.map