import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import {
  GetCartProductQuantityDto,
  UpdateCartProductQuantityDto,
} from '@mp/common/dtos';
import { RedisService } from '@mp/common/services';
import { productDetailsDtoMock } from '@mp/common/testing';

import { CartRepository } from './cart.repository';
describe('ProductRedisRepository', () => {
  let cartRepository: CartRepository;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartRepository,
        { provide: RedisService, useValue: mockDeep(RedisService) },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);

    cartRepository = module.get<CartRepository>(CartRepository);
  });

  describe('saveProductToRedisAsync', () => {
    it('should call setFieldInHash with correct key, field, and value', async () => {
      // Arrange
      const product = productDetailsDtoMock;
      const spy = jest.spyOn(redisService, 'setFieldInHash');

      // Act
      await cartRepository.saveProductToRedisAsync(product);

      // Assert
      expect(spy).toHaveBeenCalledWith(
        'products',
        String(product.id),
        JSON.stringify(product),
      );
    });
    it('should set expiration on products hash', async () => {
      // Arrange
      const product = productDetailsDtoMock;
      const spy = jest.spyOn(redisService, 'setKeyExpiration');
      // Act
      await cartRepository.saveProductToRedisAsync(product);

      // Assert
      expect(spy).toHaveBeenCalledWith('products', 5400);
    });
  });
  describe('getProductByIdFromRedisAsync', () => {
    it('should call getFieldValue with correct key and field', async () => {
      // Arrange
      const product = productDetailsDtoMock;
      const spy = jest.spyOn(redisService, 'getFieldValue');

      // Act
      await cartRepository.getProductByIdFromRedisAsync(product.id);

      // Assert
      expect(spy).toHaveBeenCalledWith('products', String(product.id));
    });
    it('should set expiration on products hash', async () => {
      // Arrange
      const product = productDetailsDtoMock;
      const spy = jest.spyOn(redisService, 'setKeyExpiration');
      // Act
      await cartRepository.getProductByIdFromRedisAsync(product.id);

      // Assert
      expect(spy).toHaveBeenCalledWith('products', 5400);
    });
  });

  describe('updateProductQuantityInCartAsync', () => {
    it('should call setFieldInHash with cart key, productId, and quantity', async () => {
      // Arrange
      const cartId = 123;
      const dto: UpdateCartProductQuantityDto = {
        productId: 10,
        quantity: 5,
      };
      const spy = jest.spyOn(redisService, 'setFieldInHash');

      // Act
      await cartRepository.updateProductQuantityInCartAsync(cartId, dto);

      // Assert
      expect(spy).toHaveBeenCalledWith(
        `cart:${cartId}`,
        String(dto.productId),
        String(dto.quantity),
      );
    });
  });

  describe('getProductQuantityFromCartAsync', () => {
    it('should call getFieldValue with cart key and productId', async () => {
      // Arrange
      const cartId = 123;
      const dto: GetCartProductQuantityDto = { productId: 10 };
      const spy = jest.spyOn(redisService, 'getFieldValue');

      // Act
      await cartRepository.getProductQuantityFromCartAsync(cartId, dto);

      // Assert
      expect(spy).toHaveBeenCalledWith(`cart:${cartId}`, String(dto.productId));
    });

    it('should return parsed number when value exists', async () => {
      // Arrange
      const cartId = 123;
      const dto: GetCartProductQuantityDto = { productId: 10 };
      jest.spyOn(redisService, 'getFieldValue').mockResolvedValueOnce('7');

      // Act
      const result = await cartRepository.getProductQuantityFromCartAsync(
        cartId,
        dto,
      );

      // Assert
      expect(result).toBe(7);
    });

    it('should return null when value does not exist', async () => {
      // Arrange
      const cartId = 123;
      const dto: GetCartProductQuantityDto = { productId: 10 };
      jest.spyOn(redisService, 'getFieldValue').mockResolvedValueOnce(null);

      // Act
      const result = await cartRepository.getProductQuantityFromCartAsync(
        cartId,
        dto,
      );

      // Assert
      expect(result).toBeNull();
    });
    it('should set expiration on cart hash when getProductQuantityFromCartAsync is called', async () => {
      // Arrange
      const cartId = 123;
      const cartKey = `cart:${cartId}`;
      const dto: GetCartProductQuantityDto = {
        productId: 10,
      };
      const spy = jest.spyOn(redisService, 'setKeyExpiration');
      // Act
      await cartRepository.getProductQuantityFromCartAsync(cartId, dto);

      // Assert
      expect(spy).toHaveBeenCalledWith(cartKey, 5400);
    });

    it('should set expiration on cart hash when updateProductQuantityInCartAsync is called', async () => {
      // Arrange
      const cartId = 123;
      const cartKey = `cart:${cartId}`;
      const dto: UpdateCartProductQuantityDto = {
        productId: 10,
        quantity: 5,
      };
      const spy = jest.spyOn(redisService, 'setKeyExpiration');
      // Act
      await cartRepository.updateProductQuantityInCartAsync(cartId, dto);

      // Assert
      expect(spy).toHaveBeenCalledWith(cartKey, 5400);
    });
  });
});
