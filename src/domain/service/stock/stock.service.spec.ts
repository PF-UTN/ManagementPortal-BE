import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Stock } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { StockChangedField, StockChangeTypeIds } from '@mp/common/constants';
import { CreateManyStockChangeDto, StockDto } from '@mp/common/dtos';
import {
  PrismaUnitOfWork,
  ProductRepository,
  StockChangeRepository,
  StockRepository,
} from '@mp/repository';

import { StockService } from './stock.service';
import { ProductService } from '../product/product.service';

describe('StockService', () => {
  let service: StockService;
  let stockRepository: StockRepository;
  let stockChangeRepository: StockChangeRepository;
  let productRepository: ProductRepository;
  let unitOfWork: PrismaUnitOfWork;
  let stock: ReturnType<typeof mockDeep<Stock>>;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: StockRepository,
          useValue: mockDeep(StockRepository),
        },
        {
          provide: StockChangeRepository,
          useValue: mockDeep(StockChangeRepository),
        },
        {
          provide: ProductRepository,
          useValue: mockDeep(ProductRepository),
        },
        {
          provide: PrismaUnitOfWork,
          useValue: mockDeep(PrismaUnitOfWork),
        },
        {
          provide: ProductService,
          useValue: mockDeep(ProductService),
        },
      ],
    }).compile();

    stockRepository = module.get<StockRepository>(StockRepository);
    stockChangeRepository = module.get<StockChangeRepository>(
      StockChangeRepository,
    );
    productRepository = module.get<ProductRepository>(ProductRepository);
    unitOfWork = module.get<PrismaUnitOfWork>(PrismaUnitOfWork);

    service = module.get<StockService>(StockService);

    productService = module.get<ProductService>(ProductService);

    stock = mockDeep<Stock>();

    stock.id = 1;
    stock.productId = 1;
    stock.quantityAvailable = 100;
    stock.quantityOrdered = 5;
    stock.quantityReserved = 10;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByProductIdAsync', () => {
    it('should return stock for existing product', async () => {
      // Arrange
      const productId = 1;
      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce(stock);

      // Act
      const result = await service.findByProductIdAsync(productId);

      // Assert
      expect(result).toEqual(stock);
    });

    it('should return null for non-existing product', async () => {
      // Arrange
      const productId = 1;
      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce(null);

      // Act
      const result = await service.findByProductIdAsync(productId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateStockByProductIdAsync', () => {
    it('should call updateStockAsync with correct parameters', async () => {
      // Arrange
      const productId = 1;
      const stockDtoMock: StockDto = {
        quantityAvailable: 50,
        quantityOrdered: 5,
        quantityReserved: 10,
      };
      const updatedStock = { ...stock, quantityAvailable: 50 };

      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce(stock);

      jest
        .spyOn(stockRepository, 'updateStockAsync')
        .mockResolvedValueOnce({ ...updatedStock });

      const txMock = {} as Prisma.TransactionClient;

      // Act
      await service.updateStockByProductIdAsync(
        productId,
        stockDtoMock,
        txMock,
      );

      // Assert
      expect(stockRepository.updateStockAsync).toHaveBeenCalledWith(
        productId,
        stockDtoMock,
        txMock,
      );
    });

    it('should throw NotFoundException if stock not found', async () => {
      // Arrange
      const productId = 1;
      const stockDtoMock: StockDto = {
        quantityAvailable: 50,
        quantityOrdered: 5,
        quantityReserved: 10,
      };

      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.updateStockByProductIdAsync(productId, stockDtoMock),
      ).rejects.toThrow(NotFoundException);
    });
    it('should call productService.deleteProductFromRedisAsync after updating stock', async () => {
      // Arrange
      const productId = 1;
      const stockDtoMock: StockDto = {
        quantityAvailable: 50,
        quantityOrdered: 5,
        quantityReserved: 10,
      };
      const updatedStock = { ...stock, quantityAvailable: 50 };
      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce(stock);
      jest
        .spyOn(stockRepository, 'updateStockAsync')
        .mockResolvedValueOnce({ ...updatedStock });
      jest
        .spyOn(productService, 'deleteProductFromRedisAsync')
        .mockResolvedValueOnce(undefined);
      const txMock = {} as Prisma.TransactionClient;

      // Act
      await service.updateStockByProductIdAsync(
        productId,
        stockDtoMock,
        txMock,
      );

      // Assert
      expect(productService.deleteProductFromRedisAsync).toHaveBeenCalledWith(
        productId,
      );
    });
  });

  describe('adjustProductStockAsync', () => {
    let createManyStockChangeDtoMock: CreateManyStockChangeDto;

    beforeEach(() => {
      createManyStockChangeDtoMock = {
        productId: 1,
        changes: [
          {
            changedField: StockChangedField.QuantityAvailable,
            previousValue: stock.quantityAvailable,
            newValue: 5,
          },
        ],
        reason: 'Restock after inventory audit',
      };
    });

    it('should throw NotFoundException if product does not exists', async () => {
      // Arrange
      jest.spyOn(productRepository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.adjustProductStockAsync(createManyStockChangeDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if stock does not exist', async () => {
      // Arrange
      jest.spyOn(productRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.adjustProductStockAsync(createManyStockChangeDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if previousValue does not match current stock value', async () => {
      // Arrange
      jest.spyOn(productRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce({ ...stock, quantityAvailable: 10 });

      // Act & Assert
      await expect(
        service.adjustProductStockAsync(createManyStockChangeDtoMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call unitOfWork.execute with the correct transaction client', async () => {
      // Arrange
      jest.spyOn(productRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce(stock);

      // Act
      await service.adjustProductStockAsync(createManyStockChangeDtoMock);

      // Assert
      expect(unitOfWork.execute).toHaveBeenCalled();
    });

    it('should call stockRepository.updateStockAsync with correct data', async () => {
      // Arrange
      const stockUpdateDataMock = {
        quantityAvailable: 5,
      };
      jest.spyOn(productRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce(stock);

      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      // Act
      await service.adjustProductStockAsync(createManyStockChangeDtoMock);

      // Assert
      expect(stockRepository.updateStockAsync).toHaveBeenCalledWith(
        stock.id,
        stockUpdateDataMock,
        txMock,
      );
    });

    it('should call stockChangeRepository.createManyStockChangeAsync with correct data', async () => {
      // Arrange
      const stockUpdatesMock = [
        {
          productId: stock.productId,
          changeTypeId: StockChangeTypeIds.Adjustment,
          changedField: StockChangedField.QuantityAvailable,
          previousValue: stock.quantityAvailable,
          newValue: 5,
          reason: 'Restock after inventory audit',
        },
      ];
      jest.spyOn(productRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce(stock);

      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      // Act
      await service.adjustProductStockAsync(createManyStockChangeDtoMock);

      // Assert
      expect(
        stockChangeRepository.createManyStockChangeAsync,
      ).toHaveBeenCalledWith(stockUpdatesMock, txMock);
    });
    it('should call productService.deleteProductFromRedisAsync after adjusting stock', async () => {
      // Arrange
      jest.spyOn(productRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(stockRepository, 'findByProductIdAsync')
        .mockResolvedValueOnce(stock);

      const txMock = {} as Prisma.TransactionClient;
      jest.spyOn(unitOfWork, 'execute').mockImplementation(async (cb) => {
        return cb(txMock);
      });

      const deleteFromRedisSpy = jest.spyOn(
        productService,
        'deleteProductFromRedisAsync',
      );

      // Act
      await service.adjustProductStockAsync(createManyStockChangeDtoMock);

      // Assert
      expect(deleteFromRedisSpy).toHaveBeenCalledWith(
        createManyStockChangeDtoMock.productId,
      );
    });
  });
});
