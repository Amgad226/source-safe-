import {
    IsArray,
    IsNotEmpty
} from 'class-validator';

export class AddUsersDto {
  @IsNotEmpty()
  @IsArray()
  users_ids: [number];

}
