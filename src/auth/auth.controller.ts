import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { Public } from 'src/decorators/public.decorators';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GeneralResponse } from 'src/base-module/response-helper';
import { HttpStatusCodeEnum } from 'src/base-module/response-status-code.enum';
import { ResponseInterface } from 'src/base-module/response.interface';
import { SignInEntity } from './entities/sign-in/sign-in.entity';
import { UserEntity } from './entities/common/user-entity';
import { BaseModuleController } from 'src/base-module/base-module.controller';

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
      status: HttpStatusCodeEnum.OK,
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
