import {
  Injectable,
  Dependencies,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MyConfigService } from 'src/my-config/my-config.service';
import { EnvEnum } from 'src/my-config/env-enum';
import * as argon from 'argon2';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private myConfigService: MyConfigService,
  ) {}

  async signIn(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    const hashedPassword = await argon.hash(pass);

    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.username, sub: user.userId };
    const tokens = await this.createTokens(payload);
    return tokens;
  }

  async createTokens(payload) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.myConfigService.get(EnvEnum.ACCESS_EXPIRE),
      secret: this.myConfigService.get(EnvEnum.ACCESS_SECRET),
    });
    const refreshToken = this.jwtService.sign(
      {
        ...payload,
        accessToken,
      },
      {
        expiresIn: this.myConfigService.get(EnvEnum.REFRESH_EXPIRE),
        secret: this.myConfigService.get(EnvEnum.REFRESH_SECRET),
      },
    );

    return { refreshToken, accessToken };
  }
}
