import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  providers: [UsersService,PrismaService,RedisService],
  exports: [UsersService],
  controllers: [UsersController],

})
export class UsersModule {}
