import { Controller } from '@nestjs/common';
import { GeneralResponse } from 'src/base-module/response-helper';
import { ResponseInterface } from 'src/base-module/response.interface';

@Controller('base-module')
export class BaseModuleController {
  returnResponse({
    data,
    message,
    status,
  }: Partial<ResponseInterface<typeof data>>): ResponseInterface<typeof data> {
    return new GeneralResponse({
      data,
      message,
      status,
    });
  }
}
