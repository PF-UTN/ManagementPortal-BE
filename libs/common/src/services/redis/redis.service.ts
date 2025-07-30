import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: RedisClientType,
  ) {}

  async setFieldInHash(
    key: string,
    field: string,
    value: string | number,
  ): Promise<void> {
    await this.redisClient.hSet(key, field, value);
  }

  async setMultipleFieldsInHash(
    key: string,
    fields: Record<string, string | number>,
  ): Promise<void> {
    await this.redisClient.hSet(key, fields);
  }

  async getFieldValue(key: string, field: string): Promise<string | null> {
    return await this.redisClient.hGet(key, field);
  }

  async getObjectByKey(key: string): Promise<Record<string, string>> {
    return await this.redisClient.hGetAll(key);
  }

  async removeFieldFromObject(key: string, field: string): Promise<void> {
    await this.redisClient.hDel(key, field);
  }

  async getFieldCount(key: string): Promise<number> {
    return await this.redisClient.hLen(key);
  }

  async incrementFieldValue(
    key: string,
    field: string,
    amount: number,
  ): Promise<number> {
    return await this.redisClient.hIncrBy(key, field, amount);
  }

  async deleteKey(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async keyExists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async fieldExistsInObject(key: string, field: string): Promise<boolean> {
    const exists = await this.redisClient.hExists(key, field);
    return exists === 1;
  }

  async getAllFieldNames(key: string): Promise<string[]> {
    return this.redisClient.hKeys(key);
  }

  async setKeyExpiration(key: string, seconds: number): Promise<boolean> {
    const result = await this.redisClient.expire(key, seconds);
    return result === 1;
  }
}
