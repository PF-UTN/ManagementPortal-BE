import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { CartService } from './../../../domain/service/cart/cart.service';
import { DeleteProductCartCommand } from './delete-product-cart.command';
import { DeleteProductCartCommandHandler } from './delete-product-cart.command.handler';

describe('DeleteProductCartCommandHandler', () => {
  let handler: DeleteProductCartCommandHandler;
  let cartService: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductCartCommandHandler,
        {
          provide: CartService,
          useValue: mockDeep(CartService),
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    handler = module.get<DeleteProductCartCommandHandler>(
      DeleteProductCartCommandHandler,
    );
  });

  it('should be defined', () => {
    // Arrange + Act + Assert
    expect(handler).toBeDefined();
  });

  it('should call cartService.deleteProductFromCartAsync with correct parameters', async () => {
    // Arrange
    const command = new DeleteProductCartCommand(1, { productId: 2 });
    jest
      .spyOn(cartService, 'deleteProductFromCartAsync')
      .mockResolvedValueOnce();
    // Act
    await handler.execute(command);
    // Assert
    expect(cartService.deleteProductFromCartAsync).toHaveBeenCalledWith(
      command.cartId,
      command.deleteProductFromCartDto,
    );
  });
});
