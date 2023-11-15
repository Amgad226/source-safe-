import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiskSpaceController } from './disk-space.controller';
import { GoogleDriveService } from './google-drive/google-drive.service';

@Module({
  imports: [],
  controllers: [AppController, DiskSpaceController],
  providers: [AppService, GoogleDriveService],
})
export class AppModule {}
