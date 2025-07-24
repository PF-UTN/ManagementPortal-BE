import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: RedisClientType,
  ) {}

  async hSet(
    key: string,
    field: string,
    value: string | number,
  ): Promise<void> {
    await this.redisClient.hSet(key, field, value);
  }

  async hGet(key: string, field: string): Promise<string | null> {
    return await this.redisClient.hGet(key, field);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return await this.redisClient.hGetAll(key);
  }

  async hDel(key: string, field: string): Promise<void> {
    await this.redisClient.hDel(key, field);
  }

  async hLen(key: string): Promise<number> {
    return await this.redisClient.hLen(key);
  }

  async hIncrBy(key: string, field: string, amount: number): Promise<number> {
    return await this.redisClient.hIncrBy(key, field, amount);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async hExists(key: string, field: string): Promise<boolean> {
    const exists = await this.redisClient.hExists(key, field);
    return exists === 1;
  }

  async hKeys(key: string): Promise<string[]> {
    return this.redisClient.hKeys(key);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.redisClient.expire(key, seconds);
    return result === 1;
  }
}
