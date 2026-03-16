import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './strategies/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() dto: RegisterDto) {
        return { data: await this.authService.register(dto) };
    }

    @Post('login')
    @ApiOperation({ summary: 'Login with email/phone + password' })
    async login(@Body() dto: LoginDto) {
        return { data: await this.authService.login(dto) };
    }

    @Post('otp/send')
    @ApiOperation({ summary: 'Send OTP to phone number' })
    async sendOtp(@Body() dto: SendOtpDto) {
        return { data: await this.authService.sendOtp(dto) };
    }

    @Post('otp/verify')
    @ApiOperation({ summary: 'Verify OTP and login' })
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return { data: await this.authService.verifyOtp(dto) };
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    async refreshToken(@Body() dto: RefreshTokenDto) {
        return { data: await this.authService.refreshToken(dto.refreshToken) };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    async me(@Req() req: any) {
        return { data: await this.authService.getProfile(req.user.sub) };
    }

    @Post('profile/update')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user profile' })
    async updateProfile(@Req() req: any, @Body() dto: { displayName?: string; bio?: string }) {
        return { data: await this.authService.updateProfile(req.user.sub, dto) };
    }
}
