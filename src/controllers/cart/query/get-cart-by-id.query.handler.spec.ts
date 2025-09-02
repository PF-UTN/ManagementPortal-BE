import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { cartDtoMock } from '@mp/common/testing';

import { CartService } from './../../../domain/service/cart/cart.service';
import { GetCartByIdQuery } from './get-cart-by-id.query';
import { GetCartByIdQueryHandler } from './get-cart-by-id.query.handler';

describe('GetCartByIdQueryHandler', () => {
  let handler: GetCartByIdQueryHandler;
  let cartService: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCartByIdQueryHandler,
        {
          provide: CartService,
          useValue: mockDeep<CartService>(),
        },
      ],
    }).compile();

    handler = module.get<GetCartByIdQueryHandler>(GetCartByIdQueryHandler);
    cartService = module.get(CartService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const cartId = 1;
    it('should call cartService.getCartAsync with the query id', async () => {
      // Arrange

      const query = new GetCartByIdQuery(cartId);
      const spy = jest
        .spyOn(cartService, 'getCartAsync')
        .mockResolvedValue(cartDtoMock);

      // Act
      await handler.execute(query);

      // Assert
      expect(spy).toHaveBeenCalledWith(cartId);
    });

    it('should return the cart from cartService', async () => {
      // Arrange
      const query = new GetCartByIdQuery(cartId);
      jest.spyOn(cartService, 'getCartAsync').mockResolvedValue(cartDtoMock);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(cartDtoMock);
    });
  });
});
