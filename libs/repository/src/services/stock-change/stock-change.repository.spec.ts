import { Test, TestingModule } from '@nestjs/testing';
import { StockChange } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { StockChangedField, StockChangeTypeIds } from '@mp/common/constants';
import { StockChangeCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { StockChangeRepository } from './stock-change.repository';

describe('StockChangeRepository', () => {
  let repository: StockChangeRepository;
  let prismaService: PrismaService;
  let stockChange: ReturnType<typeof mockDeep<StockChange>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockChangeRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<StockChangeRepository>(StockChangeRepository);

    stockChange = mockDeep<StockChange>();

    stockChange.id = 1;
    stockChange.productId = 1;
    stockChange.changeTypeId = StockChangeTypeIds.Income;
    stockChange.changedField = StockChangedField.QuantityAvailable;
    stockChange.previousValue = 100;
    stockChange.newValue = 300;
    stockChange.reason = 'Purchase order 123 was received';
    stockChange.changedAt = mockDeep<Date>();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createManyStockChangeAsync', () => {
    it('should create multiple stock change records', async () => {
      // Arrange
      const changes: StockChangeCreationDataDto[] = [
        {
          productId: stockChange.productId,
          changeTypeId: stockChange.changeTypeId,
          changedField: StockChangedField.QuantityAvailable,
          previousValue: stockChange.previousValue,
          newValue: stockChange.newValue,
          reason: stockChange.reason ?? '',
        },
      ];

      jest
        .spyOn(prismaService.stockChange, 'createMany')
        .mockResolvedValueOnce({
          count: changes.length,
        });

      // Act
      await repository.createManyStockChangeAsync(changes);

      // Assert
      expect(prismaService.stockChange.createMany).toHaveBeenCalledWith({
        data: changes,
      });
    });
  });
});
