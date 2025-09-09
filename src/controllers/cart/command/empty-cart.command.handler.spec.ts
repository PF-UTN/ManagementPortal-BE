import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { CartService } from './../../../domain/service/cart/cart.service';
import { EmptyCartCommand } from './empty-cart.command';
import { EmptyCartCommandHandler } from './empty-cart.command.handler';

describe('EmptyCartCommandHandler', () => {
  let handler: EmptyCartCommandHandler;
  let cartService: CartService;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmptyCartCommandHandler,
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
    handler = module.get<EmptyCartCommandHandler>(EmptyCartCommandHandler);
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

    it('should call authenticationService.decodeTokenAsync with the correct token', async () => {
      // Arrange
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValueOnce(payloadMock);
      jest.spyOn(cartService, 'emptyCartAsync').mockResolvedValueOnce();

      const command = new EmptyCartCommand(authorizationHeader);

      // Act
      await handler.execute(command);

      // Assert
      expect(authenticationService.decodeTokenAsync).toHaveBeenCalledWith(
        token,
      );
    });

    it('should call cartService.emptyCartAsync with the decoded cartId', async () => {
      // Arrange
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValueOnce(payloadMock);
      const spy = jest
        .spyOn(cartService, 'emptyCartAsync')
        .mockResolvedValueOnce();

      const command = new EmptyCartCommand(authorizationHeader);

      // Act
      await handler.execute(command);

      // Assert
      expect(spy).toHaveBeenCalledWith(payloadMock.sub);
    });
  });
});
