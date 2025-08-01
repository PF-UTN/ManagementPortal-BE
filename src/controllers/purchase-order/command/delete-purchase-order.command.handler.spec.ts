import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DeletePurchaseOrderCommand } from './delete-purchase-order.command';
import { DeletePurchaseOrderCommandHandler } from './delete-purchase-order.command.handler';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

describe('DeletePurchaseOrderCommandHandler', () => {
  let handler: DeletePurchaseOrderCommandHandler;
  let purchaseOrderService: PurchaseOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePurchaseOrderCommandHandler,
        {
          provide: PurchaseOrderService,
          useValue: mockDeep(PurchaseOrderService),
        },
      ],
    }).compile();

    purchaseOrderService =
      module.get<PurchaseOrderService>(PurchaseOrderService);

    handler = module.get<DeletePurchaseOrderCommandHandler>(
      DeletePurchaseOrderCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call deletePurchaseOrderAsync with correct parameters', async () => {
    // Arrange
    const command = new DeletePurchaseOrderCommand(1);
    const deletePurchaseOrderAsyncSpy = jest.spyOn(
      purchaseOrderService,
      'deletePurchaseOrderAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(deletePurchaseOrderAsyncSpy).toHaveBeenCalledWith(
      command.purchaseOrderId,
    );
  });
});
