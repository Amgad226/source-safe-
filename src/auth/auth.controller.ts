import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignUpResponse } from './entities/sign-up/sign-up.response';
import { Public } from 'src/decorators/public.decorators';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponse } from './entities/sign-in/sign-in.response';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto): SignInResponse {
    return this.authService.signIn(signInDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto): SignUpResponse {
    return this.authService.signUp(signUpDto);
  }
  
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('token-by-refresh')
  newTokensByRefresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.newTokensByRefresh(refreshTokenDto);
  }
}
