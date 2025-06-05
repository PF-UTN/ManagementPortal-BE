import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { productCategoryMockData } from '@mp/common/testing';

import { ProductCategoryRepository } from './product-category.repository';
import { PrismaService } from '../prisma.service';

describe('CategoryRepository', () => {
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
    describe('getCategoriesAsync', () => {
        it('should return categories', async () => {
        // Arrange
        prismaService.productCategory.findMany.mockResolvedValueOnce(productCategoryMockData);
    
        // Act
        const result = await repository.getCategoriesAsync();
    
        // Assert
        expect(result).toEqual(productCategoryMockData);
        });
    
        it('should call findMany on prismaService.productCategory', async () => {
        // Arrange
        prismaService.productCategory.findMany.mockResolvedValueOnce([]);
    
        // Act
        await repository.getCategoriesAsync();
    
        // Assert
        expect(prismaService.productCategory.findMany).toHaveBeenCalledWith({
            orderBy: { name: 'asc' },
        });
        });
    });
}
);