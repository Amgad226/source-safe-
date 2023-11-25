import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { DiskSpaceController } from '../disk-space.controller';
import { GoogleDriveModule } from '../google-drive/google-drive.module';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { MyConfigService } from '../my-config/my-config.service';
import { UsersModule } from '../user/users.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from '../auth/guards/access-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { BaseModuleController } from '../base-module/base-module.controller';
import { RedisService } from 'src/redis/redis.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisModule } from 'src/redis/redis.module';
import { FolderModule } from 'src/folder/folder.module';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [

    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: 'localhost',
          port: 6379,
        },
      }),
    }),
    GoogleDriveModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    JwtModule,
    RedisModule,
    FolderModule,
    FileModule
  ],
  controllers: [AppController, DiskSpaceController, BaseModuleController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
    GoogleDriveService,
    MyConfigService,
    RedisService,
    PrismaService,
  ],
  exports: [RedisService, PrismaService],
})
export class AppModule {}
