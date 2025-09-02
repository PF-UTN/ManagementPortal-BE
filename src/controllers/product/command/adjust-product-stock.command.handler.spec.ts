import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { StockChangedField } from '@mp/common/constants';
import { CreateManyStockChangeDto } from '@mp/common/dtos';

import { AdjustProductStockCommand } from './adjust-product-stock.command';
import { AdjustProductStockCommandHandler } from './adjust-product-stock.command.handler';
import { StockService } from '../../../domain/service/stock/stock.service';

describe('AdjustProductStockCommandHandler', () => {
  let handler: AdjustProductStockCommandHandler;
  let stockService: StockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjustProductStockCommandHandler,
        {
          provide: StockService,
          useValue: mockDeep(StockService),
        },
      ],
    }).compile();

    stockService = module.get<StockService>(StockService);

    handler = module.get<AdjustProductStockCommandHandler>(
      AdjustProductStockCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call adjustProductStockAsync with correct parameters', async () => {
    // Arrange
    const createManyStockChangeDtoMock: CreateManyStockChangeDto = {
      productId: 1,
      changes: [
        {
          changedField: StockChangedField.QuantityAvailable,
          previousValue: 10,
          newValue: 5,
        },
      ],
      reason: 'Restock after inventory audit',
    };
    const command = new AdjustProductStockCommand(createManyStockChangeDtoMock);
    const adjustProductStockAsyncSpy = jest.spyOn(
      stockService,
      'adjustProductStockAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(adjustProductStockAsyncSpy).toHaveBeenCalledWith(
      command.createManyStockChangeDto,
    );
  });
});
