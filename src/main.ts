import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api');

  // CORS - allow admin panel and app origins
  const allowedOrigins = [
    process.env.ADMIN_URL || 'https://admin.soulconnect.in',
    process.env.APP_URL || 'https://app.soulconnect.in',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
  ];
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  });


  // Swagger API Docs (disable in production for security)
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const config = new DocumentBuilder()
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

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
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
