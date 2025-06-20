import { BadRequestException } from '@nestjs/common';
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

  describe('createOrUpdateProductCategoryAsync', () => {
    it('should call productCategoryRepository.updateProductCategoryAsync with the correct data if id is provided', async () => {
      // Arrange
      const productCategoryCreationData = {
        id: 1,
        name: 'Updated Category',
        description: 'Updated description',
      };

      jest
        .spyOn(productCategoryRepository, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(productCategoryRepository, 'updateProductCategoryAsync')
        .mockResolvedValueOnce(productCategoryCreationData);

      // Act
      await service.createOrUpdateProductCategoryAsync(
        productCategoryCreationData,
      );

      // Assert
      expect(
        productCategoryRepository.updateProductCategoryAsync,
      ).toHaveBeenCalledWith(1, {
        name: 'Updated Category',
        description: 'Updated description',
      });
    });

    it('should call productCategoryRepository.createProductCategoryAsync with the correct data if id is not provided', async () => {
      // Arrange
      const productCategoryCreationData = {
        name: 'New Category',
        description: 'New description',
      };

      jest
        .spyOn(productCategoryRepository, 'createProductCategoryAsync')
        .mockResolvedValueOnce({ id: 1, ...productCategoryCreationData });

      // Act
      await service.createOrUpdateProductCategoryAsync({
        id: undefined,
        ...productCategoryCreationData,
      });

      // Assert
      expect(
        productCategoryRepository.createProductCategoryAsync,
      ).toHaveBeenCalledWith({
        name: 'New Category',
        description: 'New description',
      });
    });

    it('should throw BadRequestException if trying to update a non-existing category', async () => {
      // Arrange
      const productCategoryCreationData = {
        id: 999,
        name: 'Non-existing Category',
        description: 'This category does not exist',
      };

      jest
        .spyOn(productCategoryRepository, 'existsAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createOrUpdateProductCategoryAsync(productCategoryCreationData),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
