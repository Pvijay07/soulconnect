import { IsEmail, IsString, MinLength, IsOptional, IsBoolean, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiPropertyOptional({ example: 'user@example.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '+919876543210' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'SecureP@ss123', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ example: 'Anonymous User' })
    @IsString()
    @IsOptional()
    displayName?: string;

    @ApiPropertyOptional({ default: false })
    @IsBoolean()
    @IsOptional()
    isAnonymous?: boolean;
}

export class LoginDto {
    @ApiPropertyOptional({ example: 'user@example.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '+919876543210' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'SecureP@ss123' })
    @IsString()
    password: string;
}

export class SendOtpDto {
    @ApiProperty({ example: '+919876543210' })
    @IsString()
    phone: string;

    @ApiPropertyOptional({ example: 'login', default: 'login' })
    @IsString()
    @IsOptional()
    purpose?: string;
}

export class VerifyOtpDto {
    @ApiProperty({ example: '+919876543210' })
    @IsString()
    phone: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    otp: string;
}

export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    refreshToken: string;
}

export class GoogleAuthDto {
    @ApiProperty()
    @IsString()
    idToken: string;
}

export class AppleAuthDto {
    @ApiProperty()
    @IsString()
    identityToken: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    fullName?: string;
}
