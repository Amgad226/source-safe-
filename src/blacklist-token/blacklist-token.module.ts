import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
// 
@Module({
  imports: [RedisModule],
  providers: [ PrismaService, RedisService],
  controllers: [],
  exports: [],
})
export class BlacklistTokenModule {}
