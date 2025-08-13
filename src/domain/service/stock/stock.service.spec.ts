import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Stock } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { StockDto } from '@mp/common/dtos';
import { StockRepository } from '@mp/repository';

import { StockService } from './stock.service';

describe('StockService', () => {
  let service: StockService;
  let stockRepository: StockRepository;
  let stock: ReturnType<typeof mockDeep<Stock>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: StockRepository,
          useValue: mockDeep(StockRepository),
        },
      ],
    }).compile();

    stockRepository = module.get<StockRepository>(StockRepository);

    service = module.get<StockService>(StockService);

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
  });
});
