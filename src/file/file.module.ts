import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { FolderHelperService } from 'src/folder/folder.helper.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { MyConfigService } from 'src/my-config/my-config.service';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'google-drive',
    }),
  ],
  controllers: [FileController],
  providers: [FileService, PrismaService, FolderHelperService,MyConfigService,GoogleDriveService],
})
export class FileModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(IsAdminInFolder)
  //     .forRoutes({ method: RequestMethod.POST, path: 'file' });
  // }
}
