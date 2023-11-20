import { Type } from '@nestjs/common';

export function Response<T>(ItemType: Type<T>): any {
  class ResponseClass {
    data: T[];

    status: number;

    message: string;
  }

  return ResponseClass;
}
