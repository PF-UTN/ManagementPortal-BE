import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { SearchProductFiltersDto } from '@mp/common/dtos';
import { productCreationDtoMock } from '@mp/common/testing';
import { productMockData } from '@mp/common/testing';

import { PrismaService } from '../prisma.service';
import { ProductRepository } from './product.repository';

describe('ProductRepository', () => {
    let repository: ProductRepository;
    let prismaService: PrismaService;
    let product: ReturnType<
        typeof mockDeep<
            Prisma.ProductGetPayload<{
                include: {
                    category: {
                        select: { name: true; description: true };
                    };
                    supplier: {
                        select: { businessName: true };
                    };
                };
            }>
        >
    >;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductRepository,
                {
                    provide: PrismaService,
                    useValue: mockDeep(PrismaService),
                },
            ],
        }).compile();

        repository = module.get<ProductRepository>(
            ProductRepository,
        );
        prismaService = module.get<PrismaService>(PrismaService);

        product = mockDeep<
            Prisma.ProductGetPayload<{
                include: {
                    category: {
                        select: { name: true; description: true };
                    };
                    supplier: {
                        select: { businessName: true };
                    };
                };
            }>
        >();

        product.id = 1;
        product.name = productCreationDtoMock.name;
        product.description = productCreationDtoMock.description;
        product.price = mockDeep<Prisma.Decimal>();
        product.enabled = productCreationDtoMock.enabled;
        product.weight = mockDeep<Prisma.Decimal>();
        product.supplierId = productCreationDtoMock.supplierId;
        product.categoryId = productCreationDtoMock.categoryId;
        product.category = {
            name: 'Test Category',
            description: 'This is a test category',
        }
        product.supplier = {
            businessName: 'Test Supplier',
        };

    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });
    describe('searchWithFiltersAsync', () => {
        it('should construct the correct query with status filter', async () => {
            // Arrange
            const searchText = 'test';
            const filters: SearchProductFiltersDto = {
                enabled: true,
                categoryName: ['Electronics'],
                supplierBusinessName: ['Supplier A'],
            };
            const page = 1;
            const pageSize = 10;

            // Act
            await repository.searchWithFiltersAsync(
                searchText,
                filters,
                page,
                pageSize,
            );

            // Assert
            expect(prismaService.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        AND: [
                            {
                                enabled: filters.enabled,
                            },
                            {
                                category: {
                                    is: {
                                        name: { in: filters.categoryName },
                                    },
                                },
                            },
                            {
                                supplier: {
                                    is: {
                                        businessName: { in: filters.supplierBusinessName },
                                    },
                                },
                            },
                            expect.any(Object),
                        ],
                    },
                }),
            );
        });

        it('should construct the correct query with search text filter', async () => {
            // Arrange
            const searchText = 'test';
            const filters: SearchProductFiltersDto = {};
            const page = 1;
            const pageSize = 10;

            // Act
            await repository.searchWithFiltersAsync(
                searchText,
                filters,
                page,
                pageSize,
            );

            // Assert
            expect(prismaService.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        AND: [
                            expect.any(Object),
                            expect.any(Object),
                            expect.any(Object),
                            {
                                OR: [
                                    {
                                        name: {
                                            contains: searchText,
                                            mode: 'insensitive',
                                        },
                                    },
                                    {
                                        description: {
                                            contains: searchText,
                                            mode: 'insensitive',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                }),
            );
        });
        it('should construct the correct query with skip and take', async () => {
            // Arrange
            const searchText = 'test';
            const filters: SearchProductFiltersDto = {};
            const page = 2;
            const pageSize = 10;

            // Act
            await repository.searchWithFiltersAsync(
                searchText,
                filters,
                page,
                pageSize,
            );

            // Assert
            expect(prismaService.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
            );
        });
        it('should construct the correct query with count of total items matched', async () => {
            // Arrange
            const searchText = 'test';
            const filters: SearchProductFiltersDto = {};
            const page = 2;
            const pageSize = 10;

            // Act
            await repository.searchWithFiltersAsync(
                searchText,
                filters,
                page,
                pageSize,
            );

            // Assert
            expect(prismaService.product.count).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        AND: [
                            expect.any(Object),
                            expect.any(Object),
                            expect.any(Object),
                            {
                                OR: [
                                    {
                                        name: {
                                            contains: searchText,
                                            mode: 'insensitive',
                                        },
                                    },
                                    {
                                        description: {
                                            contains: searchText,
                                            mode: 'insensitive',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                }),
            );
        });
    });

    describe('createProductAsync', () => {
        it('should create a new product', async () => {
            // Arrange
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { stock, ...productData } =
                productCreationDtoMock;
            const productCreateInput = {
                ...productData
            };

            jest
                .spyOn(prismaService.product, 'create')
                .mockResolvedValueOnce(product);

            // Act
            const createdProduct =
                await repository.createProductAsync(productCreateInput);

            // Assert
            expect(createdProduct).toEqual(product);
        });
    });

    describe('updateProductAsync', () => {
        it('should update an existing product', async () => {
            // Arrange
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { stock, ...productData } =
                productCreationDtoMock;
            const productUpdateInput = {
                ...productData
            };

            jest
                .spyOn(prismaService.product, 'update')
                .mockResolvedValueOnce(product);

            // Act
            const updatedProduct =
                await repository.updateProductAsync(product.id, productUpdateInput);

            // Assert
            expect(updatedProduct).toEqual(product);
        });
    });

    describe('updateEnabledProductAsync', () => {
        it('should update an existing product enabled status', async () => {
            // Arrange
            const enabled = true;

            jest
                .spyOn(prismaService.product, 'update')
                .mockResolvedValueOnce(product);

            // Act
            const updatedProduct =
                await repository.updateEnabledProductAsync(product.id, enabled);

            // Assert
            expect(updatedProduct).toEqual(product);
        });
    });

    describe('deleteProductAsync', () => {
        it('should update an existing product deletedAt field', async () => {
            // Arrange
            const deletedAt = new Date();

            jest
                .spyOn(prismaService.product, 'update')
                .mockResolvedValueOnce(product);

            // Act
            const updatedProduct =
                await repository.deleteProductAsync(product.id, deletedAt);

            // Assert
            expect(updatedProduct).toEqual(product);
        });
    });

    describe('existsAsync', () => {
      it('should return true if product exists', async () => {
        // Arrange
        const productId = 1;
        jest
          .spyOn(prismaService.product, 'findUnique')
          .mockResolvedValueOnce(product);

        // Act
        const exists = await repository.existsAsync(productId);

        // Assert
        expect(exists).toBe(true);
      });

      it('should return false if product category does not exist', async () => {
        // Arrange
        const productId = 1;
        jest
          .spyOn(prismaService.product, 'findUnique')
          .mockResolvedValueOnce(null);

        // Act
        const exists = await repository.existsAsync(productId);

        // Assert
        expect(exists).toBe(false);
      });
    });

    describe('findProductWithDetailsByIdAsync', () => {
        it('should return product with details', async () => {
            // Arrange
            jest
                .spyOn(prismaService.product, 'findUnique')
                .mockResolvedValueOnce(productMockData);

            // Act
            const result = await repository.findProductWithDetailsByIdAsync(1);

            // Assert
            expect(prismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    category: {
                        select: { name: true },
                    },
                    supplier: {
                        select: {
                            businessName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    stock: {
                        select: {
                            quantityAvailable: true,
                            quantityReserved: true,
                            quantityOrdered: true,
                        },
                    },
                },
            });
            expect(result).toEqual(productMockData);
        });
    });
    describe('findProductWithDetailsByIdAsync', () => {
        it('should return product with details', async () => {
            // Arrange
            jest
                .spyOn(prismaService.product, 'findUnique')
                .mockResolvedValueOnce(productMockData);

            // Act
            const result = await repository.findProductWithDetailsByIdAsync(1);

            // Assert
            expect(prismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    category: {
                        select: { name: true },
                    },
                    supplier: {
                        select: {
                            businessName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    stock: {
                        select: {
                            quantityAvailable: true,
                            quantityReserved: true,
                            quantityOrdered: true,
                        },
                    },
                },
            });
            expect(result).toEqual(productMockData);
        });
    });
});