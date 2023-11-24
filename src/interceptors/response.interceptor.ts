// response.interceptor.ts

import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GeneralResponse } from 'src/base-module/response-helper';
import { HttpStatusCodeEnum } from 'src/base-module/response-status-code.enum';
import { ResponseInterface } from '../base-module/response.interface';
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
