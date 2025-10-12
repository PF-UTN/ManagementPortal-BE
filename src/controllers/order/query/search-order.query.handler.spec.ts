import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  OrderDirection,
  OrderField,
  orderStatusTranslations,
} from '@mp/common/constants';
import { SearchOrderResponse } from '@mp/common/dtos';

import { SearchOrderQuery } from './search-order.query';
import { SearchOrderQueryHandler } from './search-order.query.handler';
import { OrderService } from '../../../domain/service/order/order.service';
describe('SearchOrderQueryHandler', () => {
  let handler: SearchOrderQueryHandler;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchOrderQueryHandler,
        {
          provide: OrderService,
          useValue: mockDeep(OrderService),
        },
      ],
    }).compile();

    handler = module.get<SearchOrderQueryHandler>(SearchOrderQueryHandler);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call searchWithFiltersAsync on the service with correct parameters', async () => {
    //Arrange
    const query = new SearchOrderQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
      filters: {
        statusName: ['Pending'],
        fromCreatedAtDate: '2025-01-01',
        toCreatedAtDate: '2025-12-31',
      },
      orderBy: {
        field: OrderField.CREATED_AT,
        direction: OrderDirection.ASC,
      },
    });

    jest
      .spyOn(orderService, 'searchWithFiltersAsync')
      .mockResolvedValue({ data: [], total: 0 });

    //Act
    await handler.execute(query);

    //Assert
    expect(orderService.searchWithFiltersAsync).toHaveBeenCalledWith(query);
  });

  it('should map the response correctly', async () => {
    //Arrange
    const query = new SearchOrderQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
      filters: {
        statusName: ['Pending'],
        fromCreatedAtDate: '2025-01-01',
        toCreatedAtDate: '2025-12-31',
      },
      orderBy: {
        field: OrderField.CREATED_AT,
        direction: OrderDirection.ASC,
      },
    });

    const result: Prisma.OrderGetPayload<{
      include: {
        client: {
          select: {
            id: true;
            companyName: true;
          };
        };
        orderStatus: {
          select: {
            name: true;
          };
        };
      };
    }>[] = [
      {
        id: 1,
        orderStatusId: 4,
        totalAmount: new Prisma.Decimal(1000),
        createdAt: new Date('2023-09-01'),
        clientId: 1,
        paymentDetailId: 1,
        deliveryMethodId: 1,
        shipmentId: 1,
        client: {
          id: 1,
          companyName: 'Test Client',
        },
        orderStatus: {
          name: 'Pending',
        },
      },
    ];

    const expectedTotal = 20;

    const expectedResponse = new SearchOrderResponse({
      total: expectedTotal,
      results: result.map((order) => ({
        id: order.id,
        clientName: order.client.companyName,
        orderStatus: orderStatusTranslations[order.orderStatus.name],
        createdAt: order.createdAt,
        totalAmount: order.totalAmount.toNumber(),
        shipmentId: order.shipmentId,
      })),
    });

    jest
      .spyOn(orderService, 'searchWithFiltersAsync')
      .mockResolvedValue({ data: result, total: expectedTotal });

    //Act
    const response = await handler.execute(query);
    //Assert
    expect(response).toEqual(expectedResponse);
  });
});
