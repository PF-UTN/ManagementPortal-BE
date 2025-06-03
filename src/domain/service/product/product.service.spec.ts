import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchProductFiltersDto } from '@mp/common/dtos';
import { ProductRepository } from '@mp/repository';

import { SearchProductQuery } from './../../../controllers/product/command/search-product-query';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useValue: mockDeep<ProductRepository>() },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);
  });

    it('should be defined', () => {
    expect(service).toBeDefined();
  });

describe('searchWithFiltersAsync', () => {
    it('should call searchWithFiltersAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchProductFiltersDto = {
        categoryName: ['Electronics'],
        supplierBusinessName: ['Supplier A'],
        enabled: true,
      };
      const page = 1;
      const pageSize = 10;
      const query = new SearchProductQuery({
        searchText,
        filters,
        page,
        pageSize,
      });

      // Act
      await service.searchWithFiltersAsync(query);

      // Assert
      expect(
        repository.searchWithFiltersAsync,
      ).toHaveBeenCalledWith(
        query.searchText,
        query.filters,
        query.page,
        query.pageSize,
      );
    });
  });
});