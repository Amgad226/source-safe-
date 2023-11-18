import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DiskSpaceController } from './disk-space.controller';
import { GoogleDriveModule } from './google-drive/google-drive.module';
import { GoogleDriveService } from './google-drive/google-drive.service';
import { MyConfigService } from './my-config/my-config.service';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/access-auth.guard';
import { JwtModule } from '@nestjs/jwt';

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
    JwtModule
  ],
  controllers: [AppController, DiskSpaceController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
    GoogleDriveService,
    MyConfigService,
  ],
})
export class AppModule {}
