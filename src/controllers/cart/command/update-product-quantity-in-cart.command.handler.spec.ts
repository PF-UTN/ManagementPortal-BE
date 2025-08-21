import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { productMockData } from '@mp/common/testing';

import { CartService } from './../../../domain/service/cart/cart.service';
import { ProductService } from './../../../domain/service/product/product.service';
import { UpdateCartProductQuantityCommand } from './update-product-quantity-in-cart.command';
import { UpdateCartProductQuantityCommandHandler } from './update-product-quantity-in-cart.command.handler';

describe('UpdateCartProductCommandHandler', () => {
  let handler: UpdateCartProductQuantityCommandHandler;
  let cartService: CartService;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCartProductQuantityCommandHandler,
        {
          provide: CartService,
          useValue: mockDeep(CartService),
        },
        {
          provide: ProductService,
          useValue: mockDeep(ProductService),
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    cartService = module.get<CartService>(CartService);
    handler = module.get<UpdateCartProductQuantityCommandHandler>(
      UpdateCartProductQuantityCommandHandler,
    );
  });

  it('should be defined', () => {
    // Arrange + Act + Assert
    expect(handler).toBeDefined();
  });

  it('should throw NotFoundException if product does not exist', async () => {
    // Arrange
    const command = new UpdateCartProductQuantityCommand('user1', 999, 2);
    jest
      .spyOn(productService, 'findProductByIdAsync')
      .mockResolvedValueOnce(null);

    // Act + Assert
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if product is disabled', async () => {
    // Arrange
    const disabledProduct = { ...productMockData, enabled: false };
    const command = new UpdateCartProductQuantityCommand('user1', 1, 2);
    jest
      .spyOn(productService, 'findProductByIdAsync')
      .mockResolvedValueOnce(disabledProduct);

    // Act + Assert
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should sum current quantity in cart with desired quantity and adjust to stock', async () => {
    // Arrange
    const command = new UpdateCartProductQuantityCommand('user1', 1, 3);
    const productWithStock = {
      ...productMockData,
      stock: { quantityAvailable: 5, quantityOrdered: 0, quantityReserved: 0 },
      enabled: true,
    };
    jest
      .spyOn(productService, 'findProductByIdAsync')
      .mockResolvedValueOnce(productWithStock);
    jest
      .spyOn(cartService, 'getProductQuantityFromCartAsync')
      .mockResolvedValueOnce(2);
    const spyUpdate = jest.spyOn(
      cartService,
      'updateProductQuantityInCartAsync',
    );

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result).toBe(5);
    expect(spyUpdate).toHaveBeenCalledWith('user1', 1, 5);
  });

  it('should save correct quantity if stock is sufficient', async () => {
    // Arrange
    const command = new UpdateCartProductQuantityCommand('user1', 1, 2);
    const productWithStock = {
      ...productMockData,
      stock: { quantityAvailable: 10, quantityOrdered: 0, quantityReserved: 0 },
      enabled: true,
    };
    jest
      .spyOn(productService, 'findProductByIdAsync')
      .mockResolvedValueOnce(productWithStock);
    jest
      .spyOn(cartService, 'getProductQuantityFromCartAsync')
      .mockResolvedValueOnce(3);
    const spyUpdate = jest.spyOn(
      cartService,
      'updateProductQuantityInCartAsync',
    );

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result).toBe(5);
    expect(spyUpdate).toHaveBeenCalledWith('user1', 1, 5);
  });

  it('should throw BadRequestException if desired quantity <= 0', async () => {
    // Arrange
    const command = new UpdateCartProductQuantityCommand('user1', 1, 0);

    // Act + Assert
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if finalQuantity is 0 due to no stock', async () => {
    // Arrange
    const command = new UpdateCartProductQuantityCommand('user1', 1, 5);
    const productNoStock = {
      ...productMockData,
      stock: { quantityAvailable: 0, quantityOrdered: 0, quantityReserved: 0 },
      enabled: true,
    };
    jest
      .spyOn(productService, 'findProductByIdAsync')
      .mockResolvedValueOnce(productNoStock);
    jest
      .spyOn(cartService, 'getProductQuantityFromCartAsync')
      .mockResolvedValueOnce(0);

    // Act + Assert
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });
});
