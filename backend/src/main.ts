import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — enforce DTO decorators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8081',
      'https://localhost:8081',
      'http://192.168.1.2:8081',
      'tetasin.com',
      'https://tetasin.com',
      'capacitor://localhost',
      'ionic://localhost',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-Id', 'Idempotency-Key'],
  });
  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
}
bootstrap();
