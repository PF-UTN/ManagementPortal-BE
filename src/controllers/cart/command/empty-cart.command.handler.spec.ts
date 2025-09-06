import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { CartService } from './../../../domain/service/cart/cart.service';
import { EmptyCartCommand } from './empty-cart.command';
import { EmptyCartCommandHandler } from './empty-cart.command.handler';

describe('EmptyCartCommandHandler', () => {
  let handler: EmptyCartCommandHandler;
  let cartService: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmptyCartCommandHandler,
        {
          provide: CartService,
          useValue: mockDeep(CartService),
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    handler = module.get<EmptyCartCommandHandler>(EmptyCartCommandHandler);
  });
  it('should be defined', () => {
    // Arrange + Act + Assert
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const token = 'fake-token';
    const authorizationHeader = `Bearer ${token}`;
    it('should call cartService.emptyCartAsync with correct parameters', async () => {
      // Arrange
      const command = new EmptyCartCommand(authorizationHeader);
      jest.spyOn(cartService, 'emptyCartAsync').mockResolvedValueOnce();

      // Act
      await handler.execute(command);

      // Assert
      expect(cartService.emptyCartAsync).toHaveBeenCalledWith(token);
    });
  });
});
