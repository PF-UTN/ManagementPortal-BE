import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { SearchProductFiltersDto } from '@mp/common/dtos';
import { RedisService } from '@mp/common/services';
import {
  productCreationDtoMock,
  productDetailsDtoMock,
} from '@mp/common/testing';
import { productMockData } from '@mp/common/testing';

import { PrismaService } from '../prisma.service';
import { ProductRepository } from './product.repository';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let prismaService: PrismaService;
  let redisService: RedisService;
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
        {
          provide: RedisService,
          useValue: mockDeep(RedisService),
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    redisService = module.get<RedisService>(RedisService);

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
    };
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
                deletedAt: null,
              },
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
              {
                deletedAt: null,
              },
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
              {
                deletedAt: null,
              },
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
      const { stock, ...productData } = productCreationDtoMock;
      const productCreateInput = {
        ...productData,
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
      const { stock, ...productData } = productCreationDtoMock;
      const productUpdateInput = {
        ...productData,
      };

      jest
        .spyOn(prismaService.product, 'update')
        .mockResolvedValueOnce(product);

      // Act
      const updatedProduct = await repository.updateProductAsync(
        product.id,
        productUpdateInput,
      );

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
      const updatedProduct = await repository.updateEnabledProductAsync(
        product.id,
        enabled,
      );

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
      const updatedProduct = await repository.deleteProductAsync(
        product.id,
        deletedAt,
      );

      // Assert
      expect(updatedProduct).toEqual(product);
    });
  });

  describe('existsAsync', () => {
    it('should return true if product exists', async () => {
      // Arrange
      const productId = 1;
      jest
        .spyOn(prismaService.product, 'findFirst')
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
        .spyOn(prismaService.product, 'findFirst')
        .mockResolvedValueOnce(null);

      // Act
      const exists = await repository.existsAsync(productId);

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('existsManyAsync', () => {
    it('should return true if all products exist', async () => {
      // Arrange
      const productIds = [1, 2, 3];
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValueOnce([
        { ...product, id: 1 },
        { ...product, id: 2 },
        { ...product, id: 3 },
      ]);

      // Act
      const exists = await repository.existsManyAsync(productIds);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if not all products exist', async () => {
      // Arrange
      const productIds = [1, 2, 3];
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValueOnce([
        { ...product, id: 1 },
        { ...product, id: 2 },
      ]);

      // Act
      const exists = await repository.existsManyAsync(productIds);
      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('findProductWithDetailsByIdAsync', () => {
    it('should return product with details', async () => {
      // Arrange
      jest
        .spyOn(prismaService.product, 'findFirst')
        .mockResolvedValueOnce(productMockData);

      // Act
      const result = await repository.findProductWithDetailsByIdAsync(1);

      // Assert
      expect(prismaService.product.findFirst).toHaveBeenCalledWith({
        where: { AND: [{ id: 1 }, { deletedAt: null }] },
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
  describe('saveProductToRedisAsync', () => {
    it('should call setFieldInHash with correct key, field, and value', async () => {
      // Arrange
      const product = productDetailsDtoMock;
      const spy = jest.spyOn(redisService, 'setFieldInHash');

      // Act
      await repository.saveProductToRedisAsync(product);

      // Assert
      expect(spy).toHaveBeenCalledWith(
        'products',
        String(product.id),
        JSON.stringify(product),
      );
    });
    it('should set expiration on products hash', async () => {
      // Arrange
      const product = productDetailsDtoMock;
      const spy = jest.spyOn(redisService, 'setKeyExpiration');
      // Act
      await repository.saveProductToRedisAsync(product);

      // Assert
      expect(spy).toHaveBeenCalledWith('products', 5400);
    });
  });
  describe('getProductByIdFromRedisAsync', () => {
    it('should call getFieldValue with correct key and field', async () => {
      // Arrange
      const product = productDetailsDtoMock;
      const spy = jest.spyOn(redisService, 'getFieldValue');

      // Act
      await repository.getProductByIdFromRedisAsync(product.id);

      // Assert
      expect(spy).toHaveBeenCalledWith('products', String(product.id));
    });
    it('should set expiration on products hash', async () => {
      // Arrange
      const product = productDetailsDtoMock;
      const spy = jest.spyOn(redisService, 'setKeyExpiration');
      // Act
      await repository.getProductByIdFromRedisAsync(product.id);

      // Assert
      expect(spy).toHaveBeenCalledWith('products', 5400);
    });
  });
  describe('findManyProductsWithSupplierIdAsync', () => {
    it('should return products with supplier IDs', async () => {
      // Arrange
      const productIds = [product.id];
      jest
        .spyOn(prismaService.product, 'findMany')
        .mockResolvedValueOnce([product]);

      // Act
      const result =
        await repository.findManyProductsWithSupplierIdAsync(productIds);

      // Assert
      expect(result).toEqual([product]);
    });

    it('should return empty array if no products found', async () => {
      // Arrange
      const productIds = [product.id];
      jest.spyOn(prismaService.product, 'findMany').mockResolvedValueOnce([]);

      // Act
      const result =
        await repository.findManyProductsWithSupplierIdAsync(productIds);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
