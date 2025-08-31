import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { OrderDirection, ProductOrderField } from '@mp/common/constants';
import { SearchProductFiltersDto } from '@mp/common/dtos';
import {
  productCreationDtoMock,
  productDetailsDtoMock,
  productMockData,
  productUpdateDtoMock,
} from '@mp/common/testing';
import {
  PrismaUnitOfWork,
  ProductRepository,
  StockRepository,
} from '@mp/repository';

import { SearchProductQuery } from './../../../controllers/product/command/search-product-query';
import { ProductService } from './product.service';
import { ProductCategoryService } from '../product-category/product-category.service';
import { SupplierService } from '../supplier/supplier.service';

describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;
  let productCategoryService: ProductCategoryService;
  let supplierService: SupplierService;
  let stockRepository: StockRepository;
  let unitOfWork: PrismaUnitOfWork;
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
        ProductService,
        { provide: ProductRepository, useValue: mockDeep<ProductRepository>() },
        {
          provide: ProductCategoryService,
          useValue: mockDeep<ProductCategoryService>(),
        },
        { provide: SupplierService, useValue: mockDeep<SupplierService>() },
        { provide: StockRepository, useValue: mockDeep<StockRepository>() },
        { provide: PrismaUnitOfWork, useValue: mockDeep<PrismaUnitOfWork>() },
      ],
    }).compile();

    productCategoryService = module.get<ProductCategoryService>(
      ProductCategoryService,
    );
    supplierService = module.get<SupplierService>(SupplierService);
    stockRepository = module.get<StockRepository>(StockRepository);

    unitOfWork = module.get<PrismaUnitOfWork>(PrismaUnitOfWork);

    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);

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
    expect(service).toBeDefined();
  });

  describe('searchWithFiltersAsync', () => {
    it('should call searchWithFiltersAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const filters: SearchProductFiltersDto = {
        categoryName: ['Electronics'],
        supplierBusinessName: ['Supplier A'],
        enabled: true,
      };
      const orderBy = {
        field: ProductOrderField.NAME,
        direction: OrderDirection.ASC,
      };
      const page = 1;
      const pageSize = 10;
      const query = new SearchProductQuery({
        searchText,
        filters,
        page,
        pageSize,
        orderBy,
      });

      // Act
      await service.searchWithFiltersAsync(query);

      // Assert
      expect(repository.searchWithFiltersAsync).toHaveBeenCalledWith(
        query.searchText,
        query.filters,
        query.page,
        query.pageSize,
        query.orderBy,
      );
    });
  });

  describe('createProductAsync', () => {
    it('should execute the method within a transaction using unitOfWork.execute', async () => {
      // Arrange
      jest
        .spyOn(productCategoryService, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest.spyOn(supplierService, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(repository, 'createProductAsync')
        .mockResolvedValueOnce(product);

      const executeSpy = jest
        .spyOn(unitOfWork, 'execute')
        .mockImplementation(async (cb) => {
          const tx = {} as Prisma.TransactionClient;
          return cb(tx);
        });

      // Act
      await service.createProductAsync(productCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalled();
    });

    it('should call productRepository.createProductAsync with correct data', async () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { stock, ...productData } = productCreationDtoMock;
      const txMock = {} as Prisma.TransactionClient;

      jest
        .spyOn(productCategoryService, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest.spyOn(supplierService, 'existsAsync').mockResolvedValueOnce(true);

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      const createProductAsyncSpy = jest
        .spyOn(repository, 'createProductAsync')
        .mockResolvedValueOnce(product);

      // Act
      await service.createProductAsync(productCreationDtoMock);

      // Assert
      expect(createProductAsyncSpy).toHaveBeenCalledWith(
        {
          ...productData,
        },
        txMock,
      );
    });

    it('should call stockRepository.createStockAsync with correct data', async () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { stock, ...otherData } = productCreationDtoMock;
      const txMock = {} as Prisma.TransactionClient;

      jest
        .spyOn(productCategoryService, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest.spyOn(supplierService, 'existsAsync').mockResolvedValueOnce(true);

      jest
        .spyOn(repository, 'createProductAsync')
        .mockResolvedValueOnce(product);

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      const createStockAsyncSpy = jest.spyOn(
        stockRepository,
        'createStockAsync',
      );

      // Act
      await service.createProductAsync(productCreationDtoMock);

      // Assert
      expect(createStockAsyncSpy).toHaveBeenCalledWith(
        {
          ...stock,
          productId: product.id,
        },
        txMock,
      );
    });

    it('should throw BadRequestException if product category does not exist', async () => {
      // Arrange
      jest
        .spyOn(productCategoryService, 'existsAsync')
        .mockResolvedValueOnce(false);

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        const tx = {} as Prisma.TransactionClient;
        return cb(tx);
      });

      // Act & Assert
      await expect(
        service.createProductAsync(productCreationDtoMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if supplier does not exist', async () => {
      // Arrange
      jest
        .spyOn(productCategoryService, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest.spyOn(supplierService, 'existsAsync').mockResolvedValueOnce(false);

      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        const tx = {} as Prisma.TransactionClient;
        return cb(tx);
      });

      // Act & Assert
      await expect(
        service.createProductAsync(productCreationDtoMock),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProductAsync', () => {
    it('should call productRepository.updateProductAsync with correct data', async () => {
      // Arrange
      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(productCategoryService, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest.spyOn(supplierService, 'existsAsync').mockResolvedValueOnce(true);

      const updateProductAsyncSpy = jest
        .spyOn(repository, 'updateProductAsync')
        .mockResolvedValueOnce(product);

      // Act
      await service.updateProductAsync(product.id, productUpdateDtoMock);

      // Assert
      expect(updateProductAsyncSpy).toHaveBeenCalledWith(
        product.id,
        productUpdateDtoMock,
      );
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateProductAsync(product.id, productUpdateDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product category does not exist', async () => {
      // Arrange
      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(productCategoryService, 'existsAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateProductAsync(product.id, productUpdateDtoMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if supplier does not exist', async () => {
      // Arrange
      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(productCategoryService, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest.spyOn(supplierService, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateProductAsync(product.id, productUpdateDtoMock),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteProductAsync', () => {
    it('should call deleteProductAsync on the repository with correct parameters', async () => {
      // Arrange
      const productId = 1;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(repository, 'deleteProductAsync')
        .mockResolvedValueOnce(product);

      // Act
      await service.deleteProductAsync(productId);

      // Assert
      expect(repository.deleteProductAsync).toHaveBeenCalledWith(
        productId,
        expect.any(Date),
      );
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      const productId = 1;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(service.deleteProductAsync(productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateEnabledProductAsync', () => {
    it('should call updateEnabledProductAsync on the repository with correct parameters', async () => {
      // Arrange
      const productId = 1;
      const enabled = true;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(repository, 'updateEnabledProductAsync')
        .mockResolvedValueOnce(product);

      // Act
      await service.updateEnabledProductAsync(productId, enabled);

      // Assert
      expect(repository.updateEnabledProductAsync).toHaveBeenCalledWith(
        productId,
        enabled,
      );
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      const productId = 1;
      const enabled = true;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateEnabledProductAsync(productId, enabled),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('findProductByIdAsync', () => {
    it('should return product from Redis if found', async () => {
      // Arrange
      const redisProductMock = productDetailsDtoMock;
      jest
        .spyOn(repository, 'getProductByIdFromRedisAsync')
        .mockResolvedValue(redisProductMock);

      // Act
      const result = await service.findProductByIdAsync(redisProductMock.id);

      // Assert
      expect(result).toEqual(redisProductMock);
    });
    it('should call repository and save to Redis if product not in Redis but found in DB', async () => {
      // Arrange
      jest
        .spyOn(repository, 'getProductByIdFromRedisAsync')
        .mockResolvedValue(null);
      jest
        .spyOn(repository, 'findProductWithDetailsByIdAsync')
        .mockResolvedValue(productMockData);
      const saveSpy = jest
        .spyOn(repository, 'saveProductToRedisAsync')
        .mockResolvedValue(undefined);

      // Act
      const result = await service.findProductByIdAsync(productMockData.id);

      // Assert
      expect(saveSpy).toHaveBeenCalledWith(result);
    });
    it('should throw NotFoundException if product not found in Redis or DB', async () => {
      // Arrange
      jest
        .spyOn(service, 'getProductByIdFromRedisAsync')
        .mockResolvedValue(null);
      jest
        .spyOn(repository, 'findProductWithDetailsByIdAsync')
        .mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findProductByIdAsync(productMockData.id),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('saveProductToRedisAsync', () => {
    it('should call saveProductToRedisAsync on cartRepository', async () => {
      // Arrange
      const spySave = jest
        .spyOn(repository, 'saveProductToRedisAsync')
        .mockResolvedValueOnce();

      // Act
      await service.saveProductToRedisAsync(productDetailsDtoMock);

      // Assert
      expect(spySave).toHaveBeenCalledWith(productDetailsDtoMock);
    });
  });

  describe('getProductByIdFromRedisAsync', () => {
    it('should return product from cartRepository', async () => {
      // Arrange
      jest
        .spyOn(repository, 'getProductByIdFromRedisAsync')
        .mockResolvedValueOnce(productDetailsDtoMock);

      // Act
      const result = await service.getProductByIdFromRedisAsync(1);

      // Assert
      expect(result).toEqual(productDetailsDtoMock);
    });

    it('should propagate error if cartRepository fails', async () => {
      // Arrange
      const error = new Error('Redis connection failed');
      jest
        .spyOn(repository, 'getProductByIdFromRedisAsync')
        .mockRejectedValueOnce(error);

      // Act + Assert
      await expect(service.getProductByIdFromRedisAsync(1)).rejects.toThrow(
        error,
      );
    });
  });
});
