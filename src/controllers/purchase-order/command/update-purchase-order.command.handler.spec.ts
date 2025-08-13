import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { PurchaseOrderStatusId } from '@mp/common/constants';
import { PurchaseOrderUpdateDto } from '@mp/common/dtos';

import { UpdatePurchaseOrderCommand } from './update-purchase-order.command';
import { UpdatePurchaseOrderCommandHandler } from './update-purchase-order.command.handler';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

describe('UpdatePurchaseOrderCommandHandler', () => {
  let handler: UpdatePurchaseOrderCommandHandler;
  let purchaseOrderService: PurchaseOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePurchaseOrderCommandHandler,
        {
          provide: PurchaseOrderService,
          useValue: mockDeep(PurchaseOrderService),
        },
      ],
    }).compile();

    purchaseOrderService =
      module.get<PurchaseOrderService>(PurchaseOrderService);

    handler = module.get<UpdatePurchaseOrderCommandHandler>(
      UpdatePurchaseOrderCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call updatePurchaseOrderAsync with correct parameters', async () => {
    // Arrange
    const id = 1;
    const purchaseorderUpdateDtoMock: PurchaseOrderUpdateDto = {
      estimatedDeliveryDate: new Date('1990-01-15'),
      effectiveDeliveryDate: new Date('1990-01-20'),
      observation: 'Purchase order for office supplies',
      purchaseOrderStatusId: PurchaseOrderStatusId.Draft,
      purchaseOrderItems: [
        {
          productId: 1,
          quantity: 10,
          unitPrice: 100,
        },
      ],
    };
    const command = new UpdatePurchaseOrderCommand(
      id,
      purchaseorderUpdateDtoMock,
    );
    const updatePurchaseOrderAsyncSpy = jest.spyOn(
      purchaseOrderService,
      'updatePurchaseOrderAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(updatePurchaseOrderAsyncSpy).toHaveBeenCalledWith(
      command.id,
      command.purchaseOrderUpdateDto,
    );
  });
});
