import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { Request } from 'express';
import { TokenPayloadType } from 'src/base-module/token-payload-interface';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorators';
import { EnvEnum } from 'src/my-config/env-enum';
import { MyConfigService } from 'src/my-config/my-config.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private myConfigService: MyConfigService,
    private reflector: Reflector,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('');
    console.log('Check token');
    console.log('');
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayloadType>(
        token,
        {
          secret: this.myConfigService.get(EnvEnum.ACCESS_SECRET),
        },
      );
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.user.id,
        },
      });

      if (user == null) {
        throw new UnauthorizedException();
      }
      payload.user = user;
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    if ((await this.redis.isTokenBlacklisted(token)) == true) {
      throw new UnauthorizedException('black list');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
