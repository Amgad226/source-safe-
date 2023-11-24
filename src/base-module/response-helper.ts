import { HttpStatus } from '@nestjs/common';
import { ResponseInterface } from './response.interface';
export class GeneralResponse {
  data: any | null;
  status: HttpStatus;
  message: string;
  public constructor({ data, message, status }: ResponseInterface) {
    this.status = status ?? HttpStatus.OK;
    this.message = message ?? 'general message';
    this.data = data ?? null;
  }
}
