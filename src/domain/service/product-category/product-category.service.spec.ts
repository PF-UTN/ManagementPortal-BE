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

  describe('checkIfExistsByIdAsync', () => {
    it('should call productCategoryRepository.checkIfExistsByIdAsync with the correct id', async () => {
      // Arrange
      const id = 1;

      jest
        .spyOn(productCategoryRepository, 'checkIfExistsByIdAsync')
        .mockResolvedValueOnce(true);

      // Act
      await service.checkIfExistsByIdAsync(id);

      // Assert
      expect(
        productCategoryRepository.checkIfExistsByIdAsync,
      ).toHaveBeenCalledWith(id);
    });
  });
});
