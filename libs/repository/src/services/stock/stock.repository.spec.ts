import { Test, TestingModule } from '@nestjs/testing';
import { Stock } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { StockCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { StockRepository } from './stock.repository';

describe('StockRepository', () => {
  let repository: StockRepository;
  let prismaService: PrismaService;
  let stock: ReturnType<typeof mockDeep<Stock>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<StockRepository>(StockRepository);

    stock = mockDeep<Stock>();

    stock.id = 1;
    stock.productId = 1;
    stock.quantityAvailable = 100;
    stock.quantityOrdered = 5;
    stock.quantityReserved = 10;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createStockAsync', () => {
    it('should create a new stock record', async () => {
      // Arrange
      const stockCreateInput: StockCreationDataDto = {
        quantityAvailable: stock.quantityAvailable,
        quantityOrdered: stock.quantityOrdered,
        quantityReserved: stock.quantityReserved,
        productId: stock.productId,
      };

      jest.spyOn(prismaService.stock, 'create').mockResolvedValueOnce(stock);

      // Act
      const result = await repository.createStockAsync(stockCreateInput);

      // Assert
      expect(result).toEqual(stock);
    });
  });
});
