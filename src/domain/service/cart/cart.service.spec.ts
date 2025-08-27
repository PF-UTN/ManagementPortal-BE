import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import {
  mockUpdateCartProductQuantityDto,
  productDetailsDtoMock,
} from '@mp/common/testing';

import { CartRepository } from './../../../../libs/repository/src/services/cart/cart.repository';
import { CartService } from './cart.service';
import { ProductService } from '../product/product.service';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: CartRepository;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepository,
          useValue: mockDeep<CartRepository>(),
        },
        {
          provide: ProductService,
          useValue: mockDeep<ProductService>(),
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get<CartRepository>(CartRepository);
    productService = module.get<ProductService>(ProductService);
  });

  describe('updateProductQuantityInCartAsync', () => {
    it('should throw NotFoundException if product does not exist', async () => {
      //Arrange
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockRejectedValueOnce(new NotFoundException());

      //Act + Assert
      await expect(
        service.updateProductQuantityInCartAsync(
          1,
          mockUpdateCartProductQuantityDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product is disabled', async () => {
      //Arrange
      const disabledProduct = { ...productDetailsDtoMock, enabled: false };
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockResolvedValueOnce(disabledProduct);

      //Act + Assert
      await expect(
        service.updateProductQuantityInCartAsync(
          1,
          mockUpdateCartProductQuantityDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no stock available', async () => {
      //Arrange
      const noStockProduct = {
        ...productDetailsDtoMock,
        stock: {
          quantityAvailable: 0,
          quantityOrdered: 0,
          quantityReserved: 0,
        },
        enabled: true,
      };
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockResolvedValueOnce(noStockProduct);
      jest
        .spyOn(cartRepository, 'getProductQuantityFromCartAsync')
        .mockResolvedValueOnce(0);

      //Act + Assert
      await expect(
        service.updateProductQuantityInCartAsync(
          1,
          mockUpdateCartProductQuantityDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should adjust quantity to stock limit if requested > available', async () => {
      //Arrange
      const productWithStock = {
        ...productDetailsDtoMock,
        stock: {
          quantityAvailable: 5,
          quantityOrdered: 0,
          quantityReserved: 0,
        },
        enabled: true,
      };
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockResolvedValueOnce(productWithStock);
      jest
        .spyOn(cartRepository, 'getProductQuantityFromCartAsync')
        .mockResolvedValueOnce(3);
      const spyUpdate = jest.spyOn(
        cartRepository,
        'updateProductQuantityInCartAsync',
      );

      //Act
      await service.updateProductQuantityInCartAsync(1, {
        productId: 1,
        quantity: 5,
      });

      //Assert
      expect(spyUpdate).toHaveBeenCalledWith(1, { productId: 1, quantity: 5 });
    });

    it('should update quantity correctly if stock is sufficient', async () => {
      //Arrange
      const productWithStock = {
        ...productDetailsDtoMock,
        stock: {
          quantityAvailable: 10,
          quantityOrdered: 0,
          quantityReserved: 0,
        },
        enabled: true,
      };
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockResolvedValueOnce(productWithStock);
      jest
        .spyOn(cartRepository, 'getProductQuantityFromCartAsync')
        .mockResolvedValueOnce(2);
      const spyUpdate = jest.spyOn(
        cartRepository,
        'updateProductQuantityInCartAsync',
      );

      //Act
      await service.updateProductQuantityInCartAsync(1, {
        productId: 1,
        quantity: 3,
      });

      //Assert
      expect(spyUpdate).toHaveBeenCalledWith(1, { productId: 1, quantity: 5 });
    });

    it('should allow updating when final quantity equals stock available', async () => {
      //Arrange
      const product = {
        ...productDetailsDtoMock,
        stock: {
          quantityAvailable: 5,
          quantityOrdered: 0,
          quantityReserved: 0,
        },
        enabled: true,
      };
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockResolvedValueOnce(product);
      const spyUpdate = jest.spyOn(
        cartRepository,
        'updateProductQuantityInCartAsync',
      );

      //Act
      await service.updateProductQuantityInCartAsync(1, {
        productId: 1,
        quantity: 5,
      });

      //Assert
      expect(spyUpdate).toHaveBeenCalledWith(1, { productId: 1, quantity: 5 });
    });
  });

  describe('getProductQuantityFromCartAsync', () => {
    it('should return the product quantity from cart if found', async () => {
      //Arrange
      jest
        .spyOn(cartRepository, 'getProductQuantityFromCartAsync')
        .mockResolvedValueOnce(3);
      //Act
      const result = await service.getProductQuantityFromCartAsync(1, {
        productId: 10,
      });
      //Assert
      expect(result).toBe(3);
    });

    it('should return null if product is not in the cart', async () => {
      //Arrange
      jest
        .spyOn(cartRepository, 'getProductQuantityFromCartAsync')
        .mockResolvedValueOnce(null);

      //Act
      const result = await service.getProductQuantityFromCartAsync(1, {
        productId: 99,
      });

      //Assert
      expect(result).toBeNull();
    });

    it('should propagate error if repository fails', async () => {
      //Arrange
      jest
        .spyOn(cartRepository, 'getProductQuantityFromCartAsync')
        .mockRejectedValueOnce(new Error('Redis connection failed'));

      // Act + Assert
      await expect(
        service.getProductQuantityFromCartAsync(1, { productId: 1 }),
      ).rejects.toThrow('Redis connection failed');
    });
  });
  // describe('saveProductToRedisAsync', () => {
  //   it('should call saveProductToRedisAsync on cartRepository', async () => {
  //     // Arrange
  //     const spySave = jest
  //       .spyOn(cartRepository, 'saveProductToRedisAsync')
  //       .mockResolvedValueOnce();

  //     // Act
  //     await service.saveProductToRedisAsync(productDetailsDtoMock);

  //     // Assert
  //     expect(spySave).toHaveBeenCalledWith(productDetailsDtoMock);
  //   });
  // });

  // describe('getProductByIdFromRedisAsync', () => {
  //   it('should return product from cartRepository', async () => {
  //     // Arrange
  //     jest
  //       .spyOn(cartRepository, 'getProductByIdFromRedisAsync')
  //       .mockResolvedValueOnce(productDetailsDtoMock);

  //     // Act
  //     const result = await service.getProductByIdFromRedisAsync(1);

  //     // Assert
  //     expect(result).toEqual(productDetailsDtoMock);
  //   });

  //   it('should propagate error if cartRepository fails', async () => {
  //     // Arrange
  //     const error = new Error('Redis connection failed');
  //     jest
  //       .spyOn(cartRepository, 'getProductByIdFromRedisAsync')
  //       .mockRejectedValueOnce(error);

  //     // Act + Assert
  //     await expect(service.getProductByIdFromRedisAsync(1)).rejects.toThrow(
  //       error,
  //     );
  //   });
  // });
});
