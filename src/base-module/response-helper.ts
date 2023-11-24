import { HttpStatusCodeEnum } from './response-status-code.enum';
import { ResponseInterface } from './response.interface';
export class GeneralResponse {
  data: any | null;
  status: HttpStatusCodeEnum;
  message: string;
  public constructor({ data, message, status }: ResponseInterface) {
    this.status = status ?? HttpStatusCodeEnum.OK;
    this.message = message ?? 'general message';
    this.data = data ?? null;
  }
}
