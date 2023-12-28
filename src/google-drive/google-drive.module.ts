import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MyConfigModule } from 'src/my-config/my-config.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoogleDriveController } from './google-drive.controller';
import { GoogleDriveConsumer } from './google-drive.processor';
import { GoogleDriveService } from './google-drive.service';
import { UtilsAfterJob } from './utils-after-jobs.service';
import { FileService } from 'src/file/file.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'google-drive',
    }),
    MyConfigModule
  ],
  providers: [GoogleDriveConsumer,GoogleDriveService,PrismaService,UtilsAfterJob,FileService],
  
  controllers: [GoogleDriveController],
})
export class GoogleDriveModule {}
