import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { productCategoryMockData } from '@mp/common/testing';
import { ProductCategoryRepository } from '@mp/repository';

import { ProductCategoryService } from './product-category.service';

describe('ProductCategoryService', () => {
  let service: ProductCategoryService;
  let repository: DeepMockProxy<ProductCategoryRepository>;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoryService,
        { provide: ProductCategoryRepository, useValue: mockDeep<ProductCategoryRepository>() },
      ],
    }).compile();

    service = module.get<ProductCategoryService>(ProductCategoryService);
    repository = module.get(ProductCategoryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
    describe('getCategoriesAsync', () => {
        it('should call productCategoryRepository.getCategoriesAsync and return its result', async () => {
        // Arrange
       repository.getProductCategoryAsync.mockResolvedValueOnce(productCategoryMockData)
    
        // Act
        const result = await service.getProductCategoryAsync();
    
        // Assert
        expect(repository.getProductCategoryAsync).toHaveBeenCalled();
        expect(result).toEqual(productCategoryMockData);
        });
    });
})