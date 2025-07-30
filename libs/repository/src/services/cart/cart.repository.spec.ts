import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { RedisService } from '@mp/common/services';
import { productDetailsDtoMock } from '@mp/common/testing';

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
  it('should call setFieldInHash with correct key, field, and value', async () => {
    // Arrange
    const product = productDetailsDtoMock;
    const spy = jest.spyOn(redisService, 'setFieldInHash');

    // Act
    await cartRepository.saveProductToRedisAsync(product);

    // Assert
    expect(spy).toHaveBeenCalledWith(
      'products',                    
      String(product.id),           
      JSON.stringify({             
        name: product.name,
        enabled: product.enabled,
        stock: product.stock.quantityAvailable,
        price: product.price,
      })
    );
  });
});

});
