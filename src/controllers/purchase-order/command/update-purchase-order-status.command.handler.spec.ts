import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { UpdatePurchaseOrderStatusRequestDto } from '@mp/common/dtos';

import { UpdatePurchaseOrderStatusCommand } from './update-purchase-order-status.command';
import { UpdatePurchaseOrderStatusCommandHandler } from './update-purchase-order-status.command.handler';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

describe('UpdatePurchaseOrderStatusCommandHandler', () => {
  let handler: UpdatePurchaseOrderStatusCommandHandler;
  let purchaseOrderService: PurchaseOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePurchaseOrderStatusCommandHandler,
        {
          provide: PurchaseOrderService,
          useValue: mockDeep(PurchaseOrderService),
        },
      ],
    }).compile();

    purchaseOrderService =
      module.get<PurchaseOrderService>(PurchaseOrderService);
    handler = module.get<UpdatePurchaseOrderStatusCommandHandler>(
      UpdatePurchaseOrderStatusCommandHandler,
    );
  });

  it('should be defined', () => {
    // Arrange / Act / Assert
    expect(handler).toBeDefined();
  });

  it('should call updatePurchaseOrderStatusAsync with correct parameters', async () => {
    // Arrange
    const command = new UpdatePurchaseOrderStatusCommand(
      1,
      {} as UpdatePurchaseOrderStatusRequestDto,
    );
    const updatePurchaseOrderStatusAsyncSpy = jest
      .spyOn(purchaseOrderService, 'updatePurchaseOrderStatusAsync')
      .mockResolvedValue(void 0);

    // Act
    await handler.execute(command);

    // Assert
    expect(updatePurchaseOrderStatusAsyncSpy).toHaveBeenCalledWith(
      command.purchaseOrderId,
      command.purchaseOrderStatusId,
      command.observation,
      command.effectiveDeliveryDate,
    );
  });
});
