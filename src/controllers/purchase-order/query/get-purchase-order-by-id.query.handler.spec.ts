import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { PurchaseOrderStatusId } from '@mp/common/constants';
import { PurchaseOrderDetailsDto } from '@mp/common/dtos';

import { GetPurchaseOrderByIdQuery } from './get-purchase-order-by-id.query';
import { GetPurchaseOrderByIdQueryHandler } from './get-purchase-order-by-id.query.handler';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

describe('GetPurchaseOrderByIdQueryHandler', () => {
  let handler: GetPurchaseOrderByIdQueryHandler;
  let purchaseOrderService: PurchaseOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPurchaseOrderByIdQueryHandler,
        {
          provide: PurchaseOrderService,
          useValue: mockDeep(PurchaseOrderService),
        },
      ],
    }).compile();

    purchaseOrderService =
      module.get<PurchaseOrderService>(PurchaseOrderService);

    handler = module.get<GetPurchaseOrderByIdQueryHandler>(
      GetPurchaseOrderByIdQueryHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call findPurchaseOrderByIdAsync on the service', async () => {
      // Arrange
      const query = new GetPurchaseOrderByIdQuery(1);

      const purchaseOrderDetailsDtoMock: PurchaseOrderDetailsDto = {
        id: 1,
        createdAt: new Date(),
        estimatedDeliveryDate: new Date('1990-01-15'),
        effectiveDeliveryDate: null,
        observation: 'Test observation',
        totalAmount: 100.0,
        status: {
          id: PurchaseOrderStatusId.Ordered,
          name: 'Ordenada',
        },
        supplier: 'Test Supplier',
        purchaseOrderItems: [
          {
            id: 1,
            productId: 1,
            productName: 'Test Product',
            unitPrice: 10.0,
            quantity: 10,
            subtotalPrice: 100.0,
          },
        ],
      };

      jest
        .spyOn(purchaseOrderService, 'findPurchaseOrderByIdAsync')
        .mockResolvedValueOnce(purchaseOrderDetailsDtoMock);

      const findPurchaseOrderByIdAsyncSpy = jest.spyOn(
        purchaseOrderService,
        'findPurchaseOrderByIdAsync',
      );

      // Act
      await handler.execute(query);

      // Assert
      expect(findPurchaseOrderByIdAsyncSpy).toHaveBeenCalled();
    });
  });
});
