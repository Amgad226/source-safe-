import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { EnvEnum } from 'src/my-config/env-enum';
import { MyConfigService } from 'src/my-config/my-config.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { TokensEntity } from './entities/create-token.entity';
import { SignInEntity } from './entities/sign-in/sign-in.entity';
import { SignUpEntity } from './entities/sign-up/sign-up.entity';
import { BlacklistTokenService } from 'src/blacklist-token/blacklist-token.service';
import { TokenPayloadType } from 'src/base-module/token-payload-interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private myConfigService: MyConfigService,
    private prisma: PrismaService,
    private blacklistToken: BlacklistTokenService,
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
    const isPasswordMatch = user.password ==password;
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Wrong credential');
    }

    const tokens = await this.createTokens({
      user: { id: user.id, email: user.email, name: user.name },
    });
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
    const hashedPassword = password;
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    const tokens = await this.createTokens({
      user: { id: user.id, email: user.email, name: user.name },
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
        user: payload.user,
      });
      return new TokensEntity(tokens);
    } catch {
      throw new UnauthorizedException();
    }
  }
  async singOut(token: string) {
    await this.checkAccessToken(token);
    await this.blacklistToken.addToBlacklist(token);
    return true;
  }

  private async checkAccessToken(token: string) {
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.myConfigService.get(EnvEnum.ACCESS_SECRET),
      });
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async createTokens(payload: TokenPayloadType) {
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

  async accessToken({ email, password }: SignInDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (user == null) {
      throw new BadRequestException('user not found');
    }
    const isPasswordMatch =user.password== password;
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Wrong credential');
    }

    const tokens = await this.createTokens({
      user: { id: user.id, email: user.email, name: user.name },
    });
    return tokens.accessToken;
  }
}
