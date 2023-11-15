import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GoogleDriveService } from './google-drive/google-drive.service';
import { ReadableStreamBuffer } from 'stream-buffers';
import { Readable } from 'stream';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          cb(null, `${file.originalname} amgad `);
        },
      }),
    }),
  )
  async uploadFile() {
    return 'file store successfully';
  }

  @Post('/upload-drive')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToDrive(@UploadedFile() file: Express.Multer.File) {
    try {
  
    const nest_source_safe_folder = '1T_0BsIBtv4nywGDHAB2yQocw9RRhceUw';

      return await this.googleDriveService.uploadFile(file,nest_source_safe_folder);
    } catch (error) {
      return `Failed to upload file: ${error.message}`;
    }
  }
}
