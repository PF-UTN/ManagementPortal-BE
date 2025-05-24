import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchProductRequest } from '@mp/common/dtos';

import { SearchProductQuery } from './command/search-product-query';
import { ProductController } from './product.controller';

describe('ProductController', () => {
  let controller: ProductController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep<QueryBus>(),
        },
      ],
    }).compile();

    controller = module.get<ProductController>(
      ProductController,
    );
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('searchAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const request: SearchProductRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: { 
                categoryName: ['Electronics'],
                supplierBusinessName: ['Supplier A'],
                enabled: true
        },
      };

      await controller.searchAsync(request);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchProductQuery(request),
      );
    });
  });
});
