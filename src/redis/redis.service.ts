import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

import { Cart } from '@mp/common/dtos';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: RedisClientType,
  ) {}

  async set(key: string, value: Cart, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redisClient.set(key, serialized, {
        EX: ttlSeconds,
      });
    } else {
      await this.redisClient.set(key, serialized);
    }
  }
  async get<T = Cart>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

}
