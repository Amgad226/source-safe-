import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MyConfigModule } from 'src/my-config/my-config.module';
import { MyConfigService } from 'src/my-config/my-config.service';
import { UsersModule } from '../user/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [UsersModule, JwtModule, MyConfigModule, ConfigModule],
  providers: [AuthService,PrismaService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
