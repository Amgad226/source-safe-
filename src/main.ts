import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express'; // Import express module

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/upload', express.static(join(__dirname, '..', 'upload')));

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
