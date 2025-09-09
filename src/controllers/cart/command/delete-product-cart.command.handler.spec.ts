import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { CartService } from './../../../domain/service/cart/cart.service';
import { DeleteProductCartCommand } from './delete-product-cart.command';
import { DeleteProductCartCommandHandler } from './delete-product-cart.command.handler';

describe('DeleteProductCartCommandHandler', () => {
  let handler: DeleteProductCartCommandHandler;
  let cartService: CartService;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductCartCommandHandler,
        {
          provide: CartService,
          useValue: mockDeep<CartService>(),
        },
        {
          provide: AuthenticationService,
          useValue: mockDeep<AuthenticationService>(),
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    handler = module.get<DeleteProductCartCommandHandler>(
      DeleteProductCartCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const token = 'fake-token';
    const authorizationHeader = `Bearer ${token}`;
    const payloadMock = {
      sub: 1,
      email: 'test@test.com',
      role: 'User',
      permissions: [],
    };
    const deleteProductFromCartDto = { productId: 2 };

    it('should call authenticationService.decodeTokenAsync with the correct token', async () => {
      // Arrange
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValueOnce(payloadMock);
      jest
        .spyOn(cartService, 'deleteProductFromCartAsync')
        .mockResolvedValueOnce();

      const command = new DeleteProductCartCommand(
        authorizationHeader,
        deleteProductFromCartDto,
      );

      // Act
      await handler.execute(command);

      // Assert
      expect(authenticationService.decodeTokenAsync).toHaveBeenCalledWith(
        token,
      );
    });

    it('should call cartService.deleteProductFromCartAsync with cartId and dto', async () => {
      // Arrange
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValueOnce(payloadMock);
      const spy = jest
        .spyOn(cartService, 'deleteProductFromCartAsync')
        .mockResolvedValueOnce();

      const command = new DeleteProductCartCommand(
        authorizationHeader,
        deleteProductFromCartDto,
      );

      // Act
      await handler.execute(command);

      // Assert
      expect(spy).toHaveBeenCalledWith(
        payloadMock.sub,
        deleteProductFromCartDto,
      );
    });
  });
});
