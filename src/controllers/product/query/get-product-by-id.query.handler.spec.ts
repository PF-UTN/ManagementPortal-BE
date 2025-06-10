import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { getProductByIdQueryMock, productDetailsDtoMock, productMockData } from '@mp/common/testing';

import { GetProductByIdQueryHandler } from './get-product-by-id.query.handler';
import { ProductService } from '../../../domain/service/product/product.service';

describe('GetRegistrationRequestByIdQueryHandler', () => {
  let handler: GetProductByIdQueryHandler;
  let service: DeepMockProxy<ProductService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductByIdQueryHandler,
        {
          provide: ProductService,
          useValue: mockDeep<ProductService>()
     } ],
    }).compile();

    handler = module.get<GetProductByIdQueryHandler>(
      GetProductByIdQueryHandler,
    );
    service = module.get(ProductService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return ProductDetailsDto when product is found', async () => {
        // Arrange
        service.findProductByIdAsync.mockResolvedValue(productMockData)
        
        // Act
        const result = await handler.execute(getProductByIdQueryMock);
        
        // Assert
        expect(result).toEqual(productDetailsDtoMock);
    });

    it('should throw NotFoundException when product is not found ', async () => {
      // Arrange
      service.findProductByIdAsync.mockResolvedValue(
        null,
      );

      // Act
      const executePromise = handler.execute(getProductByIdQueryMock);

      // Assert
      await expect(executePromise).rejects.toEqual(
        new NotFoundException('Product with ID 1 not found.'),
      );
    });
  });
});