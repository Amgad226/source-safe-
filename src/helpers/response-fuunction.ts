import { GeneralResponse } from './response-helper';
import { ResponseInterface } from './response.interface';

export function returnResponse({ data:T, message, status }: ResponseInterface<typeof T>) {
  return new GeneralResponse({
    data:T,
    message,
    status,
  });
}
