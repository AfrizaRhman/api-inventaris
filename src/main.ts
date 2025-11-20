import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
<<<<<<< HEAD
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure body size limits for file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS (sesuaikan origin untuk production)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe: whitelist to strip unknown props, transform to DTO types
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    transformOptions: {
      enableImplicitConversion: false, // kita memakai @Type untuk conversion
    },
  }));

  // Gunakan port 3000 agar cocok dengan request Postman mu, atau override via env PORT
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
=======

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configure body size limits for file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  app.enableCors({
    origin: '*', // Adjust as needed for production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3333);
>>>>>>> origin/category
}
void bootstrap();
