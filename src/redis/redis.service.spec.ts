import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { RedisClientType } from 'redis';

import { CartItem } from '@mp/common/dtos';

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
  const value: CartItem = {
    productId: 'p1',
    quantity: 2,
  };
  const ttlSeconds = 3600;
  describe('setFieldInHash', () => {
    it('should call hSet with correct key and field-value pairs', async () => {
      // Arrange
      const spy = jest.spyOn(redisClientMock, 'hSet');

      // Act
      await service.setFieldInHash (key, value.productId, value.quantity);

      // Assert
      expect(spy).toHaveBeenCalledWith(key, value.productId, value.quantity);
    });
  });
  describe('getFieldValue', () => {
    it('should return the value of the given field', async () => {
      // Arrange
      jest
        .spyOn(redisClientMock, 'hGet')
        .mockResolvedValueOnce(value.quantity.toString());

      // Act
      const result = await service.getFieldValue(key, value.productId);

      // Assert
      expect(result).toBe(value.quantity.toString());
    });
    it('should return null when the field does not exist', async () => {
      // Arrange
      jest.spyOn(redisClientMock, 'hGet').mockResolvedValueOnce(null);

      // Act
      const result = await service.getFieldValue(key, 'nonexistent-product');

      // Assert
      expect(result).toBeNull();
    });
  });
  describe('removeFieldFromObject', () => {
    it('should call hDel with correct key and fields', async () => {
      // Arrange
      const spy = jest.spyOn(redisClientMock, 'hDel');

      // Act
      await service.removeFieldFromObject(key, value.productId);

      // Assert
      expect(spy).toHaveBeenCalledWith(key, value.productId);
    });
  });
  describe('getObjectByKey', () => {
    it('should return all fields and values of the hash', async () => {
      // Arrange
      const hash = { product1: '5', product2: '3' };
      jest.spyOn(redisClientMock, 'hGetAll').mockResolvedValueOnce(hash);

      // Act
      const result = await service.getObjectByKey(key);

      // Assert
      expect(result).toEqual(hash);
    });
  });
  describe('fieldExistsInObject', () => {
    it('should return true when the field exists in the hash', async () => {
      // Arrange
      jest.spyOn(redisClientMock, 'hExists').mockResolvedValueOnce(1);

      // Act
      const result = await service.fieldExistsInObject(key, value.productId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when the field does not exist in the hash', async () => {
      // Arrange
      jest.spyOn(redisClientMock, 'hExists').mockResolvedValueOnce(0);

      // Act
      const result = await service.fieldExistsInObject(key, value.productId);

      // Assert
      expect(result).toBe(false);
    });
  });
  describe('deleteKey', () => {
    it('should call del with correct key', async () => {
      // Arrange
      const spy = jest.spyOn(redisClientMock, 'del');

      // Act
      await service.deleteKey(key);

      // Assert
      expect(spy).toHaveBeenCalledWith(key);
    });
  });

  describe('keyExists', () => {
    it('should return true when key exists', async () => {
      // Arrange
      const spy = jest
        .spyOn(redisClientMock, 'exists')
        .mockResolvedValueOnce(1);

      // Act
      const result = await service.keyExists(key);

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
      const result = await service.keyExists(key);

      // Assert
      expect(result).toBe(false);
      expect(spy).toHaveBeenCalledWith(key);
    });
  });
  describe('getAllFieldNames', () => {
    it('should return an empty array if no fields are present', async () => {
      // Arrange
      jest.spyOn(redisClientMock, 'hKeys').mockResolvedValueOnce([]);

      // Act
      const result = await service.getAllFieldNames('cart:999');

      // Assert
      expect(result).toEqual([]);
    });
    it('should return all field names if present', async () => {
      // Arrange
      const mockFields = ['product1', 'product2'];
      jest.spyOn(redisClientMock, 'hKeys').mockResolvedValueOnce(mockFields);

      // Act
      const result = await service.getAllFieldNames('cart:123');

      // Assert
      expect(result).toEqual(mockFields);
    });
  });
  describe('setKeyExpiration', () => {
    it('should return true if expire is set successfully', async () => {
      // Arrange
      const spy = jest
        .spyOn(redisClientMock, 'expire')
        .mockResolvedValueOnce(1);

      // Act
      const result = await service.setKeyExpiration(key, ttlSeconds);

      // Assert
      expect(spy).toHaveBeenCalledWith(key, ttlSeconds);
      expect(result).toBe(true);
    });

    it('should return false if key does not exist and expire not set', async () => {
      // Arrange
      const spy = jest
        .spyOn(redisClientMock, 'expire')
        .mockResolvedValueOnce(0);

      // Act
      const result = await service.setKeyExpiration(key, ttlSeconds);

      // Assert
      expect(spy).toHaveBeenCalledWith(key, ttlSeconds);
      expect(result).toBe(false);
    });
  });
});
