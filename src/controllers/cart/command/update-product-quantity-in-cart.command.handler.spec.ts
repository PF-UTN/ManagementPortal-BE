import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { mockUpdateCartProductQuantityDto } from '@mp/common/testing';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { CartService } from './../../../domain/service/cart/cart.service';
import { UpdateCartProductQuantityCommand } from './update-product-quantity-in-cart.command';
import { UpdateCartProductQuantityCommandHandler } from './update-product-quantity-in-cart.command.handler';

describe('UpdateCartProductQuantityCommandHandler', () => {
  let handler: UpdateCartProductQuantityCommandHandler;
  let cartService: CartService;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCartProductQuantityCommandHandler,
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
    handler = module.get<UpdateCartProductQuantityCommandHandler>(
      UpdateCartProductQuantityCommandHandler,
    );
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

    it('should throw BadRequestException if desired quantity <= 0', async () => {
      // Arrange
      const dto = { ...mockUpdateCartProductQuantityDto, quantity: 0 };
      const command = new UpdateCartProductQuantityCommand(
        authorizationHeader,
        dto,
      );

      // Act + Assert
      await expect(handler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should call authenticationService.decodeTokenAsync with the token', async () => {
      // Arrange
      const dto = { ...mockUpdateCartProductQuantityDto, quantity: 2 };
      const command = new UpdateCartProductQuantityCommand(
        authorizationHeader,
        dto,
      );
      const decodeSpy = jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest
        .spyOn(cartService, 'updateProductQuantityInCartAsync')
        .mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(decodeSpy).toHaveBeenCalledWith(token);
    });

    it('should call cartService.updateProductQuantityInCartAsync with cartId and dto', async () => {
      // Arrange
      const dto = { ...mockUpdateCartProductQuantityDto, quantity: 2 };
      const command = new UpdateCartProductQuantityCommand(
        authorizationHeader,
        dto,
      );
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      const spy = jest
        .spyOn(cartService, 'updateProductQuantityInCartAsync')
        .mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(spy).toHaveBeenCalledWith(payloadMock.sub, dto);
    });
  });
});
