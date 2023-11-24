import { HttpStatusCodeEnum } from './response-status-code.enum';

export class ResponseInterface <T=any>{
  message: string;
  status: HttpStatusCodeEnum;
  data: T;
}
