import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { productDetailsDtoMock } from '@mp/common/testing';

import { ProductService } from './../../../domain/service/product/product.service';
import { SaveProductRedisCommand } from './save-product-redis.command';
import { SaveProductRedisCommandHandler } from './save-product-redis.command.handler';

describe('SaveProductRedisCommandHandler', () => {
  let handler: SaveProductRedisCommandHandler;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveProductRedisCommandHandler,
        {
          provide: ProductService,
          useValue: mockDeep(ProductService),
        },
      ],
    }).compile();
    productService = module.get<ProductService>(ProductService);

    handler = module.get<SaveProductRedisCommandHandler>(
      SaveProductRedisCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call saveProductToRedisAsync with correct parameters', async () => {
    // Arrange
    const command = new SaveProductRedisCommand(productDetailsDtoMock.id);
    jest
      .spyOn(productService, 'findProductByIdAsync')
      .mockResolvedValueOnce(productDetailsDtoMock);
    const spy = jest.spyOn(productService, 'saveProductToRedisAsync');

    // Act
    await handler.execute(command);

    // Assert
    expect(spy).toHaveBeenCalledWith(productDetailsDtoMock);
  });
});
