// redis.service.ts

import { Injectable } from '@nestjs/common';
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
    await this.redisClient.sadd('blacklist:tokens', token);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    // Check if the token exists in the blacklist set
    return (await this.redisClient.sismember('blacklist:tokens', token)) === 1;
  }
}
