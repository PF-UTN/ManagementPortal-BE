import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { mockUpdateCartProductQuantityDto } from '@mp/common/testing';

import { CartService } from './../../../domain/service/cart/cart.service';
import { UpdateCartProductQuantityCommand } from './update-product-quantity-in-cart.command';
import { UpdateCartProductQuantityCommandHandler } from './update-product-quantity-in-cart.command.handler';

describe('UpdateCartProductCommandHandler', () => {
  let handler: UpdateCartProductQuantityCommandHandler;
  let cartService: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCartProductQuantityCommandHandler,
        {
          provide: CartService,
          useValue: mockDeep(CartService),
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    handler = module.get<UpdateCartProductQuantityCommandHandler>(
      UpdateCartProductQuantityCommandHandler,
    );
  });

  it('should be defined', () => {
    // Arrange + Act + Assert
    expect(handler).toBeDefined();
  });

  it('should throw BadRequestException if desired quantity <= 0', async () => {
    // Arrange
    const command = new UpdateCartProductQuantityCommand(
      1,
      mockUpdateCartProductQuantityDto,
    );

    // Act + Assert
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should call cartService.updateProductQuantityInCartAsync with correct params when quantity > 0', async () => {
    // Arrange
    const dto = { ...mockUpdateCartProductQuantityDto, quantity: 2 };
    const command = new UpdateCartProductQuantityCommand(1, dto);

    const spy = jest
      .spyOn(cartService, 'updateProductQuantityInCartAsync')
      .mockResolvedValueOnce();

    // Act
    await handler.execute(command);

    // Assert
    expect(spy).toHaveBeenCalledWith(command.cartId, dto);
  });
});
