import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { RedisClientType } from 'redis';

import { Cart } from '@mp/common/dtos';

import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  const redisClientMock = mockDeep<RedisClientType>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS_CLIENT',
          useValue: redisClientMock,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });
  const key = 'cart:123';
  const value: Cart = {
    userId: 'user-1',
    items: [
      {
        productId: 'p1',
        name: 'Product 1',
        quantity: 2,
        price: 100,
      },
    ],
    totalQuantity: 2,
    totalPrice: 200,
  };
  describe('set', () => {
    it('should set the value with TTL when ttlSeconds is provided', async () => {
      // Arrange
      const ttl = 60;
      const spy = jest.spyOn(redisClientMock, 'set');

      // Act
      await service.set(key, value, ttl);

      // Assert
      expect(spy).toHaveBeenCalledWith(key, JSON.stringify(value), { EX: ttl });
    });

    it('should set the value without TTL when ttlSeconds is not provided', async () => {
      // Arrange
      const spy = jest.spyOn(redisClientMock, 'set');

      // Act
      await service.set(key, value);

      // Assert
      expect(spy).toHaveBeenCalledWith(key, JSON.stringify(value));
    });
  });
  describe('get', () => {
    it('should return parsed value when key exists', async () => {
      // Arrange
      const jsonValue = JSON.stringify(value);
      const spy = jest
        .spyOn(redisClientMock, 'get')
        .mockResolvedValueOnce(jsonValue);

      // Act
      const result = await service.get<Cart>(key);

      // Assert
      expect(result).toEqual(value);
      expect(spy).toHaveBeenCalledWith(key);
    });

    it('should return null when key does not exist', async () => {
      // Arrange
      const spy = jest
        .spyOn(redisClientMock, 'get')
        .mockResolvedValueOnce(null);

      // Act
      const result = await service.get<Cart>(key);

      // Assert
      expect(result).toBeNull();
      expect(spy).toHaveBeenCalledWith(key);
    });
  });
  describe('del', () => {
    it('should call del with correct key', async () => {
      // Arrange
      const spy = jest.spyOn(redisClientMock, 'del');

      // Act
      await service.delete(key);

      // Assert
      expect(spy).toHaveBeenCalledWith(key);
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      // Arrange
      const spy = jest
        .spyOn(redisClientMock, 'exists')
        .mockResolvedValueOnce(1);

      // Act
      const result = await service.exists(key);

      // Assert
      expect(result).toBe(true);
      expect(spy).toHaveBeenCalledWith(key);
    });

    it('should return false when key does not exist', async () => {
      // Arrange
      const spy = jest
        .spyOn(redisClientMock, 'exists')
        .mockResolvedValueOnce(0);

      // Act
      const result = await service.exists(key);

      // Assert
      expect(result).toBe(false);
      expect(spy).toHaveBeenCalledWith(key);
    });
  });
});
