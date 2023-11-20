import {
  Controller,
  Get,
  Post,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Public()
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
}
