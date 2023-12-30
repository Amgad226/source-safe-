import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';
import { log } from 'console';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  log(12312,__dirname)
  console.log(join(__dirname,  '..', 'upload'))
  app.use('/upload', express.static(join(__dirname,  '..', 'upload')));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(5000, '0.0.0.0');
}
bootstrap();
