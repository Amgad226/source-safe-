import { IsNotEmpty } from 'class-validator';

export class CheckOutDto {
  @IsNotEmpty()
  version_name: string;
}
