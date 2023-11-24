import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MyConfigModule } from 'src/my-config/my-config.module';
import { UsersModule } from '../user/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlacklistTokenService } from 'src/blacklist-token/blacklist-token.service';
import { BlacklistTokenModule } from 'src/blacklist-token/blacklist-token.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [UsersModule, JwtModule, MyConfigModule, ConfigModule,BlacklistTokenModule],
  providers: [AuthService,PrismaService,BlacklistTokenService,RedisService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
