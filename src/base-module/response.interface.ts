import { HttpStatus } from '@nestjs/common';

export class ResponseInterface <T=any>{
  message: string;
  status: HttpStatus;
  data: T;
}
