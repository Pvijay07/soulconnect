"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api');
    const isProduction = process.env.NODE_ENV === 'production';
    app.enableCors({
        origin: isProduction
            ? [process.env.ADMIN_URL || 'https://admin.soulconnect.in', process.env.APP_URL || 'https://app.soulconnect.in']
            : true,
        credentials: true,
    });
    if (!isProduction) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('SoulConnect API')
            .setDescription('SoulConnect Backend API — Emotional Support Platform')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('Auth', 'Authentication & OTP')
            .addTag('Users', 'User management')
            .addTag('Listeners', 'Listener/Expert management')
            .addTag('Calls', 'Audio/Video calls')
            .addTag('Wallet', 'Wallet & transactions')
            .addTag('Payments', 'Payment gateway integration')
            .addTag('Admin', 'Admin dashboard & management')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api-docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                filter: true,
                displayRequestDuration: true,
            },
        });
        logger.log('Swagger docs available at: /api-docs');
    }
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Backend running on: http://localhost:${port}`);
    logger.log(`📖 API docs: http://localhost:${port}/api-docs`);
    logger.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map