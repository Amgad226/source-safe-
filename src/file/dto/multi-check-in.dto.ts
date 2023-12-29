import { IsArray, IsNotEmpty } from 'class-validator';

export class MultiCheckInDto {
  @IsNotEmpty()
  @IsArray()
  ids: number[];


}
