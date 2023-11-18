import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseInterceptors(AnyFilesInterceptor())
  signIn(@Body() data) {
    // return data;
    return this.authService.signIn(data.username, data.password);
  }
}
