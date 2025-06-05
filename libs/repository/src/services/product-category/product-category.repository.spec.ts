import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { productCategoryMockData } from '@mp/common/testing';

import { ProductCategoryRepository } from './product-category.repository';
import { PrismaService } from '../prisma.service';

describe('ProductCategoryRepository', () => {
  let repository: ProductCategoryRepository;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoryRepository,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    prismaService = module.get(PrismaService);
    repository = module.get(ProductCategoryRepository);
  });
  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
    describe('getProductCategoriesAsync', () => {
        it('should return product categories', async () => {
        // Arrange
        prismaService.productCategory.findMany.mockResolvedValueOnce(productCategoryMockData);
    
        // Act
        const result = await repository.getProductCategoryAsync();
    
        // Assert
        expect(result).toEqual(productCategoryMockData);
        });
    
        it('should call findMany on prismaService.productCategory', async () => {
        // Arrange
        prismaService.productCategory.findMany.mockResolvedValueOnce([]);
    
        // Act
        await repository.getProductCategoryAsync();
    
        // Assert
        expect(prismaService.productCategory.findMany).toHaveBeenCalledWith({
            orderBy: { name: 'asc' },
        });
        });
    });
}
);