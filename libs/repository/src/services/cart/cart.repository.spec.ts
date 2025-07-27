import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { productDetailsDtoMock } from '@mp/common/testing';

import { RedisService } from './../../../../../src/redis/redis.service';
import { CartRepository } from './cart.repository';
describe('ProductRedisRepository', () => {
  let cartRepository: CartRepository;
  let redisService: RedisService;

  beforeEach(async() => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartRepository,
        { provide: RedisService, useValue: mockDeep(RedisService) },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);

    cartRepository = module.get<CartRepository>(CartRepository)
  });

  describe('saveProductToRedisAsync', () => {
    it('should call setMultipleFieldsInHash with correct key and fields', async () => {
      // Arrange
      const product = productDetailsDtoMock
      const spy = jest
        .spyOn(redisService, 'setMultipleFieldsInHash')
      // Act
      await cartRepository.saveProductToRedisAsync(product);

      // Assert
      expect(spy).toHaveBeenCalledWith('product:1', {
        name: productDetailsDtoMock.name,
        enabled: 'true',
        stock: productDetailsDtoMock.stock.quantityAvailable,
        price: productDetailsDtoMock.price,
      });
    });
  });
});
