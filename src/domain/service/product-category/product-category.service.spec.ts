import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { productCategoryMockData } from '@mp/common/testing';
import { ProductCategoryRepository } from '@mp/repository';

import { ProductCategoryService } from './product-category.service';

describe('ProductCategoryService', () => {
  let service: ProductCategoryService;
  let productCategoryRepository: ProductCategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoryService,
        {
          provide: ProductCategoryRepository,
          useValue: mockDeep(ProductCategoryRepository),
        },
      ],
    }).compile();

    productCategoryRepository = module.get<ProductCategoryRepository>(
      ProductCategoryRepository,
    );

    service = module.get<ProductCategoryService>(ProductCategoryService);
  });

  describe('existsAsync', () => {
    it('should call productCategoryRepository.existsAsync with the correct id', async () => {
      // Arrange
      const id = 1;

      jest
        .spyOn(productCategoryRepository, 'existsAsync')
        .mockResolvedValueOnce(true);

      // Act
      await service.existsAsync(id);

      // Assert
      expect(productCategoryRepository.existsAsync).toHaveBeenCalledWith(id);
    });
  });

  describe('getProductCategoryAsync', () => {
    it('should call productCategoryRepository.getProductCategoryAsync and return its result', async () => {
      // Arrange
      jest
        .spyOn(productCategoryRepository, 'getProductCategoriesAsync')
        .mockResolvedValueOnce(productCategoryMockData);

      // Act
      const result = await service.getProductCategoriesAsync();

      // Assert
      expect(
        productCategoryRepository.getProductCategoriesAsync,
      ).toHaveBeenCalled();
      expect(result).toEqual(productCategoryMockData);
    });
  });
});
