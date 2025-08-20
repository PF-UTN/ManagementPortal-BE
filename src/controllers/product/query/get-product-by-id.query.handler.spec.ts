import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import {
  getProductByIdQueryMock,
  productDetailsDtoMock,
  productMockData,
} from '@mp/common/testing';

import { CartService } from './../../../domain/service/cart/cart.service';
import { GetProductByIdQueryHandler } from './get-product-by-id.query.handler';
import { ProductService } from '../../../domain/service/product/product.service';

describe('GetProductByIdQueryHandler', () => {
  let handler: GetProductByIdQueryHandler;
  let productService: ProductService;
  let cartService: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductByIdQueryHandler,
        {
          provide: ProductService,
          useValue: mockDeep<ProductService>(),
        },
        {
          provide: CartService,
          useValue: mockDeep<CartService>(),
        },
      ],
    }).compile();

    handler = module.get<GetProductByIdQueryHandler>(
      GetProductByIdQueryHandler,
    );
    productService = module.get(ProductService);
    cartService = module.get(CartService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return ProductDetailsDto from Redis when product is found', async () => {
      // Arrange
      jest
        .spyOn(cartService, 'getProductByIdFromRedisAsync')
        .mockResolvedValue(productDetailsDtoMock);

      // Act
      const result = await handler.execute(getProductByIdQueryMock);

      // Assert
      expect(result).toEqual(productDetailsDtoMock);
    });

    it('should return ProductDetailsDto from Prisma when product is not found in Redis and save it in Redis', async () => {
      // Arrange
      jest
        .spyOn(cartService, 'getProductByIdFromRedisAsync')
        .mockResolvedValue(null);
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockResolvedValue(productMockData);
      jest
        .spyOn(cartService, 'saveProductToRedisAsync')
        .mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(getProductByIdQueryMock);

      // Assert
      expect(result).toEqual(productDetailsDtoMock);
    });

    it('should call saveProductToRedisAsync when product is found in Prisma', async () => {
      // Arrange
      jest
        .spyOn(cartService, 'getProductByIdFromRedisAsync')
        .mockResolvedValue(null);
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockResolvedValue(productMockData);
      const saveSpy = jest
        .spyOn(cartService, 'saveProductToRedisAsync')
        .mockResolvedValue(undefined);

      // Act
      await handler.execute(getProductByIdQueryMock);

      // Assert
      expect(saveSpy).toHaveBeenCalledWith(productDetailsDtoMock);
    });

    it('should throw NotFoundException when product is not found in Prisma', async () => {
      // Arrange
      jest
        .spyOn(cartService, 'getProductByIdFromRedisAsync')
        .mockResolvedValue(null);
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(getProductByIdQueryMock)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
