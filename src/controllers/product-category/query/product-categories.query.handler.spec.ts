import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { productCategoryMockData } from '@mp/common/testing';

import { ProductCategoriesQueryHandler } from './product-categories.query.handler';
import { ProductCategoryService } from '../../../domain/service/product-category/product-category.service';

describe('GetProductCategoriesQueryHandler', () => {
    let handler: ProductCategoriesQueryHandler;
    let service: DeepMockProxy<ProductCategoryService>;
    
    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductCategoriesQueryHandler,
                {
                    provide: ProductCategoryService,
                    useValue: mockDeep<ProductCategoryService>(),
                },
            ],
        }).compile();
        handler = module.get<ProductCategoriesQueryHandler>(ProductCategoriesQueryHandler);
        service = module.get(ProductCategoryService);
    });
    it('should be defined', () => {
        expect(handler).toBeDefined();
    });
    describe('execute', () => {
        it('should call getProductCategoryAsync', async () => {
            // Arrange
            service.getProductCategoriesAsync.mockResolvedValueOnce(productCategoryMockData);
            
            // Act
            await handler.execute();

            // Assert
            expect(service.getProductCategoriesAsync).toHaveBeenCalled();
        });
        it('should return product categories as DTOs', async () => {
            // Arrange
            service.getProductCategoriesAsync.mockResolvedValueOnce(productCategoryMockData);
            
            // Act
            const result = await handler.execute();

            // Assert
            expect(result).toEqual(
                productCategoryMockData.map((productCategory) => ({
                    id: productCategory.id,
                    name: productCategory.name,
                    description: productCategory.description,
                }))
            );
        });
        it('should return an empty array when no categories are found', async () => {
            // Arrange
            service.getProductCategoriesAsync.mockResolvedValueOnce([]);
            
            // Act
            const result = await handler.execute();

            // Assert
            expect(result).toEqual([]);
        });
});
    }
);
