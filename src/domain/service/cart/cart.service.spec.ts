import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import {
  mockUpdateCartProductQuantityDto,
  productDetailsDtoMock,
} from '@mp/common/testing';

import { CartRepository } from './../../../../libs/repository/src/services/cart/cart.repository';
import { ProductService } from './../product/product.service';
import { CartService } from './cart.service';
import { AuthenticationService } from '../authentication/authentication.service';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: CartRepository;
  let productService: ProductService;
  let authenticationService: AuthenticationService;

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
        {
          provide: AuthenticationService,
          useValue: mockDeep<AuthenticationService>(),
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get<CartRepository>(CartRepository);
    productService = module.get<ProductService>(ProductService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );

    jest.spyOn(authenticationService, 'decodeTokenAsync').mockResolvedValue({
      sub: 1,
      email: 'test@example.com',
      role: 'client',
      permissions: [],
    });
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
          'fake-token',
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
          'fake-token',
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
          'fake-token',
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
      await service.updateProductQuantityInCartAsync('fake-token', {
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
      await service.updateProductQuantityInCartAsync('fake-token', {
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
      await service.updateProductQuantityInCartAsync('fake-token', {
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
      const result = await service.getProductQuantityFromCartAsync(
        'fake-token',
        { productId: 10 },
      );
      //Assert
      expect(result).toBe(3);
    });

    it('should return null if product is not in the cart', async () => {
      //Arrange
      jest
        .spyOn(cartRepository, 'getProductQuantityFromCartAsync')
        .mockResolvedValueOnce(null);

      //Act
      const result = await service.getProductQuantityFromCartAsync(
        'fake-token',
        { productId: 99 },
      );

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
        service.getProductQuantityFromCartAsync('fake-token', { productId: 1 }),
      ).rejects.toThrow('Redis connection failed');
    });
  });

  describe('deleteProductFromCartAsync', () => {
    it('should throw NotFoundException if product is not in the cart', async () => {
      // Arrange
      jest
        .spyOn(cartRepository, 'existProductInCartAsync')
        .mockResolvedValueOnce(false);

      // Act + Assert
      await expect(
        service.deleteProductFromCartAsync('fake-token', { productId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call deleteProductFromCartAsync on the repository', async () => {
      // Arrange
      jest
        .spyOn(cartRepository, 'existProductInCartAsync')
        .mockResolvedValueOnce(true);
      const spyDelete = jest.spyOn(
        cartRepository,
        'deleteProductFromCartAsync',
      );

      // Act
      await service.deleteProductFromCartAsync('fake-token', { productId: 1 });

      // Assert
      expect(spyDelete).toHaveBeenCalledWith(1, { productId: 1 });
    });
  });

  describe('emptyCartAsync', () => {
    it('should call repository.emptyCartAsync with cartId from token', async () => {
      // Arrange
      jest.spyOn(cartRepository, 'emptyCartAsync').mockResolvedValue();

      // Act
      await service.emptyCartAsync('fake-token');

      // Assert
      expect(cartRepository.emptyCartAsync).toHaveBeenCalledWith(1);
    });
  });

  describe('getCartAsync', () => {
    it('should return empty cart when repository returns empty array', async () => {
      // Arrange
      jest
        .spyOn(cartRepository, 'getCartAsync')
        .mockResolvedValue({ items: [] });

      // Act
      const result = await service.getCartAsync('fake-token');

      // Assert
      expect(result).toEqual({
        cartId: '1',
        items: [],
      });
    });

    it('should return cart with items', async () => {
      // Arrange
      const cartItems = [
        { productId: 10, quantity: 2 },
        { productId: 20, quantity: 3 },
      ];
      jest
        .spyOn(cartRepository, 'getCartAsync')
        .mockResolvedValue({ items: cartItems });

      const product1 = { ...productDetailsDtoMock, id: 10 };
      const product2 = { ...productDetailsDtoMock, id: 20 };

      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockImplementation(async (id: number) => {
          if (id === 10) return product1;
          if (id === 20) return product2;
          throw new NotFoundException();
        });

      // Act
      const result = await service.getCartAsync('fake-token');

      //Assert
      expect(result).toEqual({
        cartId: '1',
        items: [
          { product: product1, quantity: 2 },
          { product: product2, quantity: 3 },
        ],
      });
    });

    it('should skip items if productService returns null', async () => {
      //Arrange
      const cartItems = [
        { productId: 10, quantity: 2 },
        { productId: 99, quantity: 1 },
      ];
      jest
        .spyOn(cartRepository, 'getCartAsync')
        .mockResolvedValue({ items: cartItems });

      const product1 = { ...productDetailsDtoMock, id: 10 };
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockImplementation(async (id: number) => {
          if (id === 10) return product1;
          throw new NotFoundException();
        });

      // Act
      const result = await service.getCartAsync('fake-token');

      // Assert
      expect(result).toEqual({
        cartId: '1',
        items: [{ product: product1, quantity: 2 }],
      });
    });
  });
});
