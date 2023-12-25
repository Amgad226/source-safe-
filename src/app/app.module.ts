import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { FileModule } from 'src/file/file.module';
import { FolderModule } from 'src/folder/folder.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../auth/guards/access-auth.guard';
import { BaseModuleController } from '../base-module/base-module.controller';
import { DiskSpaceController } from '../disk-space.controller';
import { GoogleDriveModule } from '../google-drive/google-drive.module';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { MyConfigService } from '../my-config/my-config.service';
import { UsersModule } from '../user/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseUrlMiddleware } from 'src/base-module/baseUrl.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      dest: './upload', // specify a custom upload directory
    }),
    BullModule.forRootAsync({
      useFactory:  () => ({
        redis: {
          host:  'localhost',
          port:  6379,
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
    FileModule,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the middleware globally
    consumer.apply(BaseUrlMiddleware).forRoutes('*');
  }
}
