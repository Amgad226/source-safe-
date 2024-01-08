import { IsNotEmpty } from 'class-validator';

export class RequestFileDto {
  @IsNotEmpty()
  status: boolean;
}
