import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { productDetailsDtoMock } from '@mp/common/testing';

import { GetProductByIdRedisQuery } from './get-product-by-id-redis.query';
import { GetProductByIdRedisQueryHandler } from './get-product-by-id-redis.query.handler';
import { CartService } from '../../../domain/service/cart/cart.service';

describe('GetRegistrationRequestByIdQueryHandler', () => {
  let handler: GetProductByIdRedisQueryHandler;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductByIdRedisQueryHandler,
        {
          provide: CartService,
          useValue: mockDeep<CartService>(),
        },
      ],
    }).compile();

    handler = module.get<GetProductByIdRedisQueryHandler>(
      GetProductByIdRedisQueryHandler,
    );
    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call getProductFromRedisAsync with correct parameters', async () => {
      //Arrange
      const query = new GetProductByIdRedisQuery(productDetailsDtoMock.id)
      jest
        .spyOn(service, 'getProductByIdFromRedisAsync')
        .mockResolvedValue(productDetailsDtoMock);

      //Act
      await handler.execute(query)

      //Assert
      expect(service.getProductByIdFromRedisAsync).toHaveBeenCalledWith(productDetailsDtoMock.id);
    });
    it('should return a product from Redis when found', async () => {
        //Arrange
        const query = new GetProductByIdRedisQuery(productDetailsDtoMock.id)
      jest
        .spyOn(service, 'getProductByIdFromRedisAsync')
        .mockResolvedValue(productDetailsDtoMock);

      //Act
      const result = await handler.execute(query)

      //Assert
      expect(result).toEqual(productDetailsDtoMock)
    })
  });
});
