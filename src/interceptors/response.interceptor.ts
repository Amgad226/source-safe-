// response.interceptor.ts

import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GeneralResponse } from 'src/helpers/response-helper';
import { HttpStatusCodeEnum } from 'src/helpers/response-status-code.enum';
import { ResponseInterface } from '../helpers/response.interface';
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        console.log( data);

        if (data !== undefined) {
          return new GeneralResponse({
            data: data.data,
            message: data.message,
            status: data.status,
          });
        }
        return data;
      }),
    );
  }
}
