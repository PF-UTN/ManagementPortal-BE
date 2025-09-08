import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { cartDtoMock } from '@mp/common/testing';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { CartService } from './../../../domain/service/cart/cart.service';
import { GetCartByIdQuery } from './get-cart-by-id.query';
import { GetCartByIdQueryHandler } from './get-cart-by-id.query.handler';

describe('GetCartByIdQueryHandler', () => {
  let handler: GetCartByIdQueryHandler;
  let cartService: CartService;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCartByIdQueryHandler,
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

    handler = module.get<GetCartByIdQueryHandler>(GetCartByIdQueryHandler);
    cartService = module.get<CartService>(CartService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
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

    it('should call authenticationService.decodeTokenAsync with the token extracted from authorizationHeader', async () => {
      // Arrange
      const query = new GetCartByIdQuery(authorizationHeader);
      const decodeSpy = jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest.spyOn(cartService, 'getCartAsync').mockResolvedValue(cartDtoMock);

      // Act
      await handler.execute(query);

      // Assert
      expect(decodeSpy).toHaveBeenCalledWith(token);
    });

    it('should call cartService.getCartAsync with the cartId from payload.sub', async () => {
      // Arrange
      const query = new GetCartByIdQuery(authorizationHeader);
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      const getCartSpy = jest
        .spyOn(cartService, 'getCartAsync')
        .mockResolvedValue(cartDtoMock);

      // Act
      await handler.execute(query);

      // Assert
      expect(getCartSpy).toHaveBeenCalledWith(payloadMock.sub);
    });

    it('should return the cart from cartService', async () => {
      // Arrange
      const query = new GetCartByIdQuery(authorizationHeader);
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest.spyOn(cartService, 'getCartAsync').mockResolvedValue(cartDtoMock);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(cartDtoMock);
    });
  });
});
