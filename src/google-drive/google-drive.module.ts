import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { MyConfigModule } from 'src/my-config/my-config.module';
import { MyConfigService } from 'src/my-config/my-config.service';
import { GoogleDriveController } from './google-drive.controller';
import { GoogleDriveConsumer } from './google-drive.processor';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'google-drive',
    }),
    MyConfigModule
  ],
  providers: [GoogleDriveConsumer,GoogleDriveService,PrismaService],
  controllers: [GoogleDriveController],
})
export class GoogleDriveModule {}
