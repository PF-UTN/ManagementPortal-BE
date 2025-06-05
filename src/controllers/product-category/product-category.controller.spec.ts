import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { ProductCategoryController } from './product-category.controller';
import { GetProductCategoriesQuery } from './query/get-product-categories.query';

describe('ProductCategoryController', () => {
  let controller: ProductCategoryController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCategoryController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep<QueryBus>(),
        },
      ],
    }).compile();

    controller = module.get<ProductCategoryController>(ProductCategoryController);
    queryBus = module.get<QueryBus>(QueryBus);
});

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('getProductCategoriesAsync', () => {
    it('should call execute on the queryBus', async () => {
        // Act
        const query = new GetProductCategoriesQuery();
        await controller.getProductCategoriesAsync();
        // Assert  
        expect(queryBus.execute).toHaveBeenCalledWith(query);
    });
  });
});