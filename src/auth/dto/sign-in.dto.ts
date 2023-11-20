export class CreateUserDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(4, 30)
  password: string;


}
