import {
  Injectable,
  Dependencies,
  UnauthorizedException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';

import { UsersService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { MyConfigService } from 'src/my-config/my-config.service';
import { EnvEnum } from 'src/my-config/env-enum';
import * as argon from 'argon2';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto } from './dto/sign-in.dto';
import { log } from 'console';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInEntity } from './entities/sign-in/sign-in.entity';
import { UserEntity } from './entities/common/user-entity';
import { TokensEntity } from './entities/create-token.entity';
import { UsersEntity } from './entities/common/users-entity';
import { BaseEntity } from 'src/base-module/base-entity';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private myConfigService: MyConfigService,
    private prisma: PrismaService,
  ) {}

  async signIn({ email, password }: SignInDto): Promise<SignInEntity> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        email,
      },
    });
    const isPasswordMatch = await argon.verify(user.password, password);
    if (!isPasswordMatch) {
      throw new HttpException('Wrong credential', 401);
    }
    const payload = { user_id: user.id, user_email: user.email };
    const tokens = await this.createTokens(payload);
    return new SignInEntity({ tokens, user });
  }

  async signUp({ email, name, password }: SignUpDto) {
    const userExists = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (userExists != null) {
      throw new BadRequestException('email already exists');
    }
    const hashedPassword = await argon.hash(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    const { accessToken, refreshToken } = await this.createTokens({
      user_id: user.id,
      user_email: user.email,
    });
    return {
      data: { accessToken, refreshToken, user },
      message: 'user created successfully',
      status: 201,
    };
  }
  async newTokensByRefresh({ refresh }: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(refresh, {
        secret: this.myConfigService.get(EnvEnum.REFRESH_SECRET),
      });
      log(payload);
      return await this.createTokens({
        user_id: payload.user_id,
        user_email: payload.user_email,
      });
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async createTokens(payload) {
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
