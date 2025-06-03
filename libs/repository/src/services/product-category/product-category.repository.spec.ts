import { Test, TestingModule } from '@nestjs/testing';
import { ProductCategory } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

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

  describe('checkIfExistsByIdAsync', () => {
    it('should return true if product category exists', async () => {
      // Arrange
      const productCategoryId = 1;
      jest
        .spyOn(prismaService.productCategory, 'findUnique')
        .mockResolvedValueOnce(productCategory);

      // Act
      const exists = await repository.checkIfExistsByIdAsync(productCategoryId);

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
      const exists = await repository.checkIfExistsByIdAsync(productCategoryId);

      // Assert
      expect(exists).toBe(false);
    });
  });
});
