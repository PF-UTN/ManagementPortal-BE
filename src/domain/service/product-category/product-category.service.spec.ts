import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

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
      expect(
        productCategoryRepository.existsAsync,
      ).toHaveBeenCalledWith(id);
    });
  });
});
