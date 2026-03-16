import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Profile, Wallet]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                secret: config.get('jwt.secret'),
                signOptions: { expiresIn: config.get('jwt.accessExpiry') },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
