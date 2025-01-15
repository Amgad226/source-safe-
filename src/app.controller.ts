import {
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorators';
import { TokenPayload } from 'src/decorators/user-decorator';
import { Request } from 'express';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('host-name')
  hostName(@Headers() headers,@Req() req: Request) {
    const upstreamServerInfo = req.headers['x-server-info'];
  console.log(__dirname);

    return `Hello! Request received from client.`;

    return headers.host +'  ' + req.hostname; ;
  }

  @Get()
  @Public()
  serveHtml(@Res() res: Response) {
    res.sendFile(join(__dirname, '..',  '..', 'public', 'welcome.html'));
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
