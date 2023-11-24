import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { EnvEnum } from 'src/my-config/env-enum';
import { MyConfigService } from 'src/my-config/my-config.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { TokensEntity } from './entities/create-token.entity';
import { SignInEntity } from './entities/sign-in/sign-in.entity';
import { SignUpEntity } from './entities/sign-up/sign-up.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private myConfigService: MyConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async signIn({ email, password }: SignInDto): Promise<SignInEntity> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (user == null) {
      throw new BadRequestException('user not found');
    }
    const isPasswordMatch = await argon.verify(user.password, password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Wrong credential');
    }
    const payload = { user_id: user.id, user_email: user.email };
    const tokens = await this.createTokens(payload);
    return new SignInEntity({ tokens, user });
  }

  async signUp({ email, name, password }: SignUpDto): Promise<SignUpEntity> {
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
    const tokens = await this.createTokens({
      user_id: user.id,
      user_email: user.email,
    });
    return new SignUpEntity({
      tokens,
      user,
    });
  }
  async newTokensByRefresh({
    refresh,
  }: RefreshTokenDto): Promise<TokensEntity> {
    try {
      const payload = await this.jwtService.verifyAsync(refresh, {
        secret: this.myConfigService.get(EnvEnum.REFRESH_SECRET),
      });
      const tokens = await this.createTokens({
        user_id: payload.user_id,
        user_email: payload.user_email,
      });
      return new TokensEntity(tokens);
    } catch {
      throw new UnauthorizedException();
    }
  }
  async singOut(token: string) {
    return await this.singOut(token);
  }
  private async storeTokenInBlackList(token:string): Promise<boolean> {
    await this.redis.addToBlacklist(token);
    await this.prisma.blackListToken.create({
      data: {
        token,
      },
    });
    return true;
  }

  private async checkAccessToken(token:string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.myConfigService.get(EnvEnum.ACCESS_SECRET),
      });
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async createTokens(payload:any) {
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
