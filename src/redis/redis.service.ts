// redis.service.ts

import { Injectable } from '@nestjs/common';
import { log } from 'console';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;

  constructor() {
    // Create a Redis client with default configuration
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
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
    log( (await this.redisClient.sismember('blacklist:tokens', token)) === 1)
    return (await this.redisClient.sismember('blacklist:tokens', token)) === 1;
  }
}
