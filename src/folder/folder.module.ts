import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { MyConfigService } from 'src/my-config/my-config.service';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { BullModule } from '@nestjs/bull';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'google-drive',
    }),
  ],
  controllers: [FolderController],
  providers: [FolderService, MyConfigService, GoogleDriveService,PrismaService],
})
export class FolderModule {}
