import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { productDetailsDtoMock } from '@mp/common/testing';

import { GetProductByIdQuery } from './get-product-by-id.query';
import { GetProductByIdQueryHandler } from './get-product-by-id.query.handler';
import { ProductService } from '../../../domain/service/product/product.service';

describe('GetProductByIdQueryHandler', () => {
  let handler: GetProductByIdQueryHandler;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductByIdQueryHandler,
        {
          provide: ProductService,
          useValue: mockDeep<ProductService>(),
        },
      ],
    }).compile();

    handler = module.get<GetProductByIdQueryHandler>(
      GetProductByIdQueryHandler,
    );
    productService = module.get(ProductService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call productService.findProductByIdAsync with the query id', async () => {
      // Arrange
      const query = new GetProductByIdQuery(productDetailsDtoMock.id);
      const spy = jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockResolvedValue(productDetailsDtoMock);

      // Act
      await handler.execute(query);

      // Assert
      expect(spy).toHaveBeenCalledWith(productDetailsDtoMock.id);
    });

    it('should return the product from productService', async () => {
      // Arrange
      const query = new GetProductByIdQuery(productDetailsDtoMock.id);
      jest
        .spyOn(productService, 'findProductByIdAsync')
        .mockResolvedValue(productDetailsDtoMock);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBe(productDetailsDtoMock);
    });
  });
});
