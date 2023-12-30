// redis.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';
import Redis from 'ioredis';
import { EnvEnum } from 'src/my-config/env-enum';
import { MyConfigService } from 'src/my-config/my-config.service';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;
// 
  constructor() {
    // Create a Redis client with default configuration
    this.redisClient = new Redis({
      host:  (new MyConfigService(new ConfigService)).get(EnvEnum.REDIS_HOST),
      port:  +(new MyConfigService(new ConfigService)).get(EnvEnum.REDIS_PORT),
      db: 1,
      name: 'blacklist-tokens',
    });
  }

  async addToBlacklist(token: string): Promise<void> {
    // Add the token to the blacklist set
    if (!(await this.isTokenBlacklisted(token))) {
      await this.redisClient.sadd('blacklist:tokens', token);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    // Check if the token exists in the blacklist set
    return (await this.redisClient.sismember('blacklist:tokens', token)) === 1;
  }
}
