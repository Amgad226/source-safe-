import { Controller, HttpStatus } from '@nestjs/common';
import { ResponseInterface } from 'src/base-module/response.interface';

@Controller('base-module')
export class BaseModuleController {
  
  successResponse({
    data = null,
    message = 'general message',
    status = HttpStatus.OK,
  }): ResponseInterface<typeof data> {
    return {
      data,
      message,
      status,
    };
  }
}
