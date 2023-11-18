import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { EnvEnum } from 'src/my-config/env-enum';
import { MyConfigService } from 'src/my-config/my-config.service';
import { GoogleDriveService } from './google-drive.service';
import { CreateFolderProps } from './props/create-folder.props';
import { CreateFolderDto } from './dto/create-folder.dto';

@Controller('google-drive')
export class GoogleDriveController {
  constructor(
    private myConfigService: MyConfigService,
    private go: GoogleDriveService,
    @InjectQueue('google-drive') private readonly googleDriveQueue: Queue,
  ) {}
  @Post('/upload-drive')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToDrive(@UploadedFile() file: Express.Multer.File) {
    const folder = this.myConfigService.get(
      EnvEnum.GOOGLE_DRIVE_NEST_JS_FOLDER,
    );
    this.googleDriveQueue.add(
      'upload-file',
      {
        file,
        folder,
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  @Post('/folder')
  @UseInterceptors(AnyFilesInterceptor())
  async createFolder(@Body() createFolderDto: CreateFolderDto) {
    this.googleDriveQueue.add('create-folder', createFolderDto, {
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
