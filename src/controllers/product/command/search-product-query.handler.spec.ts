import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Stock, Supplier } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { SearchProductResponse } from '@mp/common/dtos';

import { SearchProductQuery } from './search-product-query';
import { SearchProductQueryHandler } from './search-product-query.handler';
import { ProductService } from '../../../domain/service/product/product.service';

describe('ProductQueryHandler', () => {
    let handler: SearchProductQueryHandler;
    let productService: ProductService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchProductQueryHandler,
                {
                    provide: ProductService,
                    useValue: mockDeep(ProductService),
                },
            ],
        }).compile();

        handler = module.get<SearchProductQueryHandler>(
            SearchProductQueryHandler,
        );
        productService = module.get<ProductService>(
            ProductService,
        );
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });
    it('should call searchWithFiltersAsync on the service with correct parameters', async () => {
        // Arrange
        const query = new SearchProductQuery({
            searchText: 'test',
            page: 1,
            pageSize: 10,
            filters: {
                categoryName: ['Electronics'],
                supplierBusinessName: ['Supplier A'],
                enabled: true
            },
        });

        jest
            .spyOn(productService, 'searchWithFiltersAsync')
            .mockResolvedValue({ data: [], total: 0 });

        // Act
        await handler.execute(query);

        // Assert
        expect(
            productService.searchWithFiltersAsync,
        ).toHaveBeenCalledWith(query);
    });
    it('should map the response correctly', async () => {
        // Arrange
        const query = new SearchProductQuery({
            searchText: 'test',
            page: 1,
            pageSize: 1,
            filters: {
                categoryName: ['Electronics'],
                supplierBusinessName: ['Supplier A'],
                enabled: true
            },
        });
        const result = [
            mockDeep<
                Prisma.ProductGetPayload<{
                    include: {
                        category: true;
                        supplier: true;
                        stock: true;
                    };
                }>
            >({
                id: 1,
                name: 'Test Product',
                description: 'This is a test product',
                price: new Prisma.Decimal(99.99),
                enabled: true,
                weight: new Prisma.Decimal(1.5),
                categoryId: 2,
                supplierId: 3,
                category: {
                    id: 2,
                    name: 'Electronics',
                    description: 'Category description',
                },
                supplier: mockDeep<Supplier>({
                    id: 3,
                    businessName: 'Supplier A',
                    documentType: 'CUIT',
                    documentNumber: '30123456789',
                    email: 'supplier@example.com',
                    phone: '123-456-7890',
                }),
                stock: mockDeep<Stock>({
                    id: 1,
                    productId: 1,
                    quantityOrdered: 100,
                    quantityAvailable: 50,
                    quantityReserved: 10,
                }),
            }),
        ];
        const expectedTotal = 20;

        const expectedResponse = new SearchProductResponse({
            total: expectedTotal,
            results: result.map((product) => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price.toNumber(),
                enabled: product.enabled,
                weight: product.weight.toNumber(),
                categoryName: product.category.name,
                supplierBusinessName: product.supplier.businessName,
                stock: product.stock?.quantityAvailable ?? 0,
            })),
        });

        jest
            .spyOn(productService, 'searchWithFiltersAsync')
            .mockResolvedValue({ data: result, total: expectedTotal });

        // Act
        const response = await handler.execute(query);

        // Assert
        expect(response).toEqual(expectedResponse);
    });
});
