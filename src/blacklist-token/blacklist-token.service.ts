import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class BlacklistTokenService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}
  async addToBlacklist(token: string) {
    await this.redis.addToBlacklist(token);

    if (!(await this.isTokenBlacklisted(token)))
      await this.prisma.blackListToken.create({
        data: {
          token,
        },
      });
  }

  private async isTokenBlacklisted(token: string) {
    return await this.prisma.blackListToken.findFirst({ where: { token } });
  }
}
