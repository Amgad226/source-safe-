import { Controller, Get, Post, Req, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppService } from './app.service';
import { Public } from '../decorators/public.decorators';
import { TokenPayload } from 'src/decorators/user-decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getUserByToken(@TokenPayload() tokenPayload) {
    return tokenPayload;
  }

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          cb(null, `${file.originalname} ${Date.now()} `);
        },
      }),
    }),
  )
  async uploadFile() {
    return 'file store successfully';
  }
}
