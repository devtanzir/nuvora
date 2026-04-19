import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // Cookie parser
  app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO te nai emon fields strip korbe
      forbidNonWhitelisted: true, // Unknown fields jodi ashe tahole error
      transform: true, // Auto type conversion
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Nuvora API')
    .setDescription('Nuvora E-Commerce Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth')
    .addTag('Users')
    .addTag('Categories')
    .addTag('Products')
    .addTag('Cart')
    .addTag('Wishlist')
    .addTag('Orders')
    .addTag('Reviews')
    .addTag('Upload')
    .addTag('Admin')
    .addTag('Banners')
    .addTag('Promo Codes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3001}`);
  console.log(
    `Swagger docs at http://localhost:${process.env.PORT ?? 3001}/api/docs`,
  );
}
bootstrap();
