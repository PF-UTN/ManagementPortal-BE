import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { productDetailsDtoMock } from '@mp/common/testing';

import { CartRepository } from './../../../../libs/repository/src/services/cart/cart.repository';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: CartRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepository,
          useValue: mockDeep(CartRepository),
        },
      ],
    }).compile();
    service = module.get<CartService>(CartService);
    cartRepository = module.get<CartRepository>(CartRepository);
  });

  describe('saveProductToRedisAsync', () => {
    it('should call cartRepository.saveProductToRedisAsync with correct product', async () => {
      // Arrange
      const mockProduct = productDetailsDtoMock;
      const spy = jest.spyOn(cartRepository, 'saveProductToRedisAsync');
      // Act
      await service.saveProductToRedisAsync(mockProduct);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockProduct);
    });
  });
  describe('getProductByIdFromRedisAsync', () => {
    it('should call cartRepository.getProductByIdFromRedisAsync', async () => {
      // Arrange
      const mockProduct = productDetailsDtoMock;
      const spy = jest.spyOn(cartRepository, 'getProductByIdFromRedisAsync');
      // Act
      await service.getProductByIdFromRedisAsync(mockProduct.id);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  describe('updateProductQuantityInCartAsync', () => {
    it('should call cartRepository.updateProductQuantityInCartAsync with correct parameters', async () => {
      // Arrange
      const userId = '123';
      const productId = 10;
      const quantity = 5;
      const spy = jest.spyOn(
        cartRepository,
        'updateProductQuantityInCartAsync',
      );

      // Act
      await service.updateProductQuantityInCartAsync(
        userId,
        productId,
        quantity,
      );

      // Assert
      expect(spy).toHaveBeenCalledWith(userId, productId, quantity);
    });
  });

  describe('getProductQuantityFromCartAsync', () => {
    it('should call cartRepository.getProductQuantityFromCartAsync with correct parameters', async () => {
      // Arrange
      const userId = '123';
      const productId = 10;
      const spy = jest.spyOn(cartRepository, 'getProductQuantityFromCartAsync');

      // Act
      await service.getProductQuantityFromCartAsync(userId, productId);

      // Assert
      expect(spy).toHaveBeenCalledWith(userId, productId);
    });
  });
});
