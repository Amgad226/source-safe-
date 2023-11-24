import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common';
import { BaseModuleController } from 'src/base-module/base-module.controller';
import { ResponseInterface } from 'src/base-module/response.interface';
import { Public } from 'src/decorators/public.decorators';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInEntity } from './entities/sign-in/sign-in.entity';

@Controller('auth')
export class AuthController extends BaseModuleController {
  constructor(private authService: AuthService) {
    super();
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
  ): Promise<ResponseInterface<SignInEntity>> {
    return this.returnResponse({
      data: await this.authService.signIn(signInDto),
      message: 'from controller ',
      status: HttpStatus.OK,
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto): any {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('token-by-refresh')
  newTokensByRefresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.newTokensByRefresh(refreshTokenDto);
  }
}
