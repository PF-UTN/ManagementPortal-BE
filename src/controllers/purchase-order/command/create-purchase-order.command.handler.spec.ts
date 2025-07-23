import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { PurchaseOrderCreationDto } from '@mp/common/dtos';

import { CreatePurchaseOrderCommand } from './create-purchase-order.command';
import { CreatePurchaseOrderCommandHandler } from './create-purchase-order.command.handler';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

describe('CreatePurchaseOrderCommandHandler', () => {
  let handler: CreatePurchaseOrderCommandHandler;
  let purchaseOrderService: PurchaseOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePurchaseOrderCommandHandler,
        {
          provide: PurchaseOrderService,
          useValue: mockDeep(PurchaseOrderService),
        },
      ],
    }).compile();

    purchaseOrderService =
      module.get<PurchaseOrderService>(PurchaseOrderService);

    handler = module.get<CreatePurchaseOrderCommandHandler>(
      CreatePurchaseOrderCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call createPurchaseOrderAsync with correct parameters', async () => {
    // Arrange
    const purchaseorderCreationDtoMock: PurchaseOrderCreationDto = {
      supplierId: 1,
      estimatedDeliveryDate: new Date('1990-01-15'),
      observation: 'Purchase order for office supplies',
      purchaseOrderItems: [
        {
          productId: 1,
          quantity: 10,
          unitPrice: 100,
        },
      ],
    };
    const command = new CreatePurchaseOrderCommand(
      purchaseorderCreationDtoMock,
    );
    const createPurchaseOrderAsyncSpy = jest.spyOn(
      purchaseOrderService,
      'createPurchaseOrderAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(createPurchaseOrderAsyncSpy).toHaveBeenCalledWith(
      command.purchaseOrderCreationDto,
    );
  });
});
