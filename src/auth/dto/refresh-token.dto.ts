import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refresh: string;
}
