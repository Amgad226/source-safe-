import { Controller, Get, Post, Req, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppService } from './app.service';
import { Public } from '../decorators/public.decorators';
import { User } from 'src/decorators/user-decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getUserByToken(@User() user) {
    return user;
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
