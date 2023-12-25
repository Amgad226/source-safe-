import {
  IsNotEmpty
} from 'class-validator';

export class RemoveUserDto {
  @IsNotEmpty()
  user_id: number;

}
