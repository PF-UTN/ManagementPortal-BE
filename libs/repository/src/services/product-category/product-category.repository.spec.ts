import { Test, TestingModule } from '@nestjs/testing';
import { ProductCategory } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { productCategoryMockData } from '@mp/common/testing';

import { PrismaService } from '../prisma.service';
import { ProductCategoryRepository } from './product-category.repository';

describe('ProductCategoryRepository', () => {
  let repository: ProductCategoryRepository;
  let prismaService: PrismaService;
  let productCategory: ReturnType<typeof mockDeep<ProductCategory>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoryRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<ProductCategoryRepository>(
      ProductCategoryRepository,
    );

    productCategory = mockDeep<ProductCategory>();

    productCategory.id = 1;
    productCategory.name = 'Test Category';
    productCategory.description = 'This is a test category';
  });

  describe('existsAsync', () => {
    it('should return true if product category exists', async () => {
      // Arrange
      const productCategoryId = 1;
      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockResolvedValueOnce(productCategory);

      // Act
      const exists = await repository.existsAsync(productCategoryId);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if product category does not exist', async () => {
      // Arrange
      const productCategoryId = 1;
      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const exists = await repository.existsAsync(productCategoryId);

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('getProductCategoriesAsync', () => {
    it('should return product categories', async () => {
      // Arrange
      jest
        .spyOn(prismaService.productCategory, 'findMany')
        .mockResolvedValueOnce(productCategoryMockData);

      // Act
      const result = await repository.getProductCategoriesAsync();

      // Assert
      expect(result).toEqual(productCategoryMockData);
    });

    it('should call findMany on prismaService.productCategory', async () => {
      // Arrange
      jest
        .spyOn(prismaService.productCategory, 'findMany')
        .mockResolvedValueOnce([]);

      // Act
      await repository.getProductCategoriesAsync();

      // Assert
      expect(prismaService.productCategory.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('createProductCategoryAsync', () => {
    it('should create a product category with the provided data', async () => {
      // Arrange
      const productCategoryData = {
        name: 'New Category',
        description: 'This is a new category',
      };
      jest
        .spyOn(prismaService.productCategory, 'create')
        .mockResolvedValueOnce(productCategory);

      // Act
      const result =
        await repository.createProductCategoryAsync(productCategoryData);

      // Assert
      expect(result).toEqual(productCategory);
    });

    it('should call prismaService.productCategory.create with correct data', async () => {
      // Arrange
      const productCategoryData = {
        name: 'New Category',
        description: 'This is a new category',
      };
      jest
        .spyOn(prismaService.productCategory, 'create')
        .mockResolvedValueOnce(productCategory);

      // Act
      await repository.createProductCategoryAsync(productCategoryData);

      // Assert
      expect(prismaService.productCategory.create).toHaveBeenCalledWith({
        data: productCategoryData,
      });
    });
  });

  describe('updateProductCategoryAsync', () => {
    it('should update a product category with the provided data', async () => {
      // Arrange
      const productCategoryId = 1;
      const updatedData = {
        name: 'Updated Category',
        description: 'This is an updated category',
      };
      jest
        .spyOn(prismaService.productCategory, 'update')
        .mockResolvedValueOnce(productCategory);

      // Act
      const result = await repository.updateProductCategoryAsync(
        productCategoryId,
        updatedData,
      );

      // Assert
      expect(result).toEqual(productCategory);
    });

    it('should call prismaService.productCategory.update with correct data', async () => {
      // Arrange
      const productCategoryId = 1;
      const updatedData = {
        name: 'Updated Category',
        description: 'This is an updated category',
      };
      jest
        .spyOn(prismaService.productCategory, 'update')
        .mockResolvedValueOnce(productCategory);

      // Act
      await repository.updateProductCategoryAsync(
        productCategoryId,
        updatedData,
      );

      // Assert
      expect(prismaService.productCategory.update).toHaveBeenCalledWith({
        where: { id: productCategoryId },
        data: updatedData,
      });
    });
  });
});
