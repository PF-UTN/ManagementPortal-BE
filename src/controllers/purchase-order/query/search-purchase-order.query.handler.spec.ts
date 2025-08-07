import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { OrderDirection, PurchaseOrderField } from '@mp/common/constants';
import {
  SearchPurchaseOrderResponse,
} from '@mp/common/dtos';

import { PurchaseOrderService } from './../../../domain/service/purchase-order/purchase-order.service';
import { SearchPurchaseOrderQuery } from './search-purchase-order.query';
import { SearchPurchaseOrderQueryHandler } from './search-purchase-order.query.handler';
describe('SearchPurchaseOrderQueryHandler', () => {
  let handler: SearchPurchaseOrderQueryHandler;
  let purchaseOrderService: PurchaseOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchPurchaseOrderQueryHandler,
        {
          provide: PurchaseOrderService,
          useValue: mockDeep(PurchaseOrderService),
        },
      ],
    }).compile();

    handler = module.get<SearchPurchaseOrderQueryHandler>(
      SearchPurchaseOrderQueryHandler,
    );
    purchaseOrderService =
      module.get<PurchaseOrderService>(PurchaseOrderService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call searchWithFiltersAsync on the service with correct parameters', async () => {
    //Arrange
    const query = new SearchPurchaseOrderQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
      filters: {
        statusName: ['Ordered'],
        supplierBusinessName: ['Supplier A'],
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
        fromEstimatedDeliveryDate: '2025-01-15',
        toEstimatedDeliveryDate: '2025-01-20',
      },
      orderBy: {
        field: PurchaseOrderField.CREATED_AT,
        direction: OrderDirection.ASC,
      },
    });

    jest
      .spyOn(purchaseOrderService, 'searchWithFiltersAsync')
      .mockResolvedValue({ data: [], total: 0 });
    //Act
    await handler.execute(query);

    //Assert
    expect(purchaseOrderService.searchWithFiltersAsync).toHaveBeenCalledWith(
      query,
    );
  });

  it('should map the response correctly', async () => {
    //Arrange
    const query = new SearchPurchaseOrderQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
      filters: {
        statusName: ['Ordered'],
        supplierBusinessName: ['Supplier A'],
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
        fromEstimatedDeliveryDate: '2025-01-15',
        toEstimatedDeliveryDate: '2025-01-20',
      },
      orderBy: {
        field: PurchaseOrderField.CREATED_AT,
        direction: OrderDirection.ASC,
      },
    });

    const result: Prisma.PurchaseOrderGetPayload<{
      include: {
        supplier: {
          select: {
            id: true;
            businessName: true;
          };
        };
        purchaseOrderStatus: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    }>[] = [
      {
        id: 1,
        estimatedDeliveryDate: new Date('2023-10-01'),
        purchaseOrderStatusId: 4,
        totalAmount: new Prisma.Decimal(1000),
        supplierId: 1,
        observation: 'Test observation',
        effectiveDeliveryDate: new Date('2023-10-05'),
        createdAt: new Date('2023-09-01'),
        supplier: {
          id: 1,
          businessName: 'Mock Supplier',
        },
        purchaseOrderStatus: {
          id: 4,
          name: 'Delivered',
        },
      },
    ];

    const expectedTotal = 20;

    const expectedResponse = new SearchPurchaseOrderResponse({
      total: expectedTotal,
      results: result.map((purchaseOrder) => ({
        id: purchaseOrder.id,
        supplierBussinesName: purchaseOrder.supplier.businessName,
        purchaseOrderStatusName: purchaseOrder.purchaseOrderStatus.name,
        createdAt: purchaseOrder.createdAt,
        estimatedDeliveryDate:
          purchaseOrder.estimatedDeliveryDate,
        effectiveDeliveryDate:
        purchaseOrder.effectiveDeliveryDate ?? new Date(0),
        totalAmount: purchaseOrder.totalAmount.toNumber(),
      })),
    });

    jest
      .spyOn(purchaseOrderService, 'searchWithFiltersAsync')
      .mockResolvedValue({ data: result, total: expectedTotal });

    //Act
    const response = await handler.execute(query);
    //Assert
    expect(response).toEqual(expectedResponse);
  });
});
