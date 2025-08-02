import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { OrderDirection, PurchaseOrderField } from '@mp/common/constants';
import { PurchaseOrderCreationDto, SearchPurchaseOrderRequest } from '@mp/common/dtos';

import { CreatePurchaseOrderCommand } from './command/create-purchase-order.command';
import { PurchaseOrderController } from './purchase-order.controller';
import { SearchPurchaseOrderQuery } from './query/search-purchase-order.query';

describe('PurchaseOrderController', () => {
  let controller: PurchaseOrderController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrderController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockDeep(CommandBus),
        },
        {
          provide: QueryBus,
          useValue: mockDeep(QueryBus),
        },
      ],
    }).compile();

    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    controller = module.get<PurchaseOrderController>(PurchaseOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('searchPurchaseOrdersAsync', () => {
    it('should call queryBus.execute with SearchPurchaseOrderQuery and correct params', async () => {
      // Arrange
      const request: SearchPurchaseOrderRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: {
          statusId: [1],
          supplierBusinessName: ['Supplier A'],
          fromDate: '2025-01-01',
          toDate: '2025-12-31',
          fromEffectiveDeliveryDate: '2025-01-15',
          toEffectiveDeliveryDate: '2025-01-20',
        },
        orderBy: {
          field: PurchaseOrderField.CREATED_AT,
          direction: OrderDirection.ASC,
        },
      };
      // Act
      await controller.searchPurchaseOrdersAsync(request);
      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchPurchaseOrderQuery(request),
      );
    });
  });
  describe('createPurchaseOrderAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const purchaseOrderCreationDtoMock: PurchaseOrderCreationDto = {
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
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreatePurchaseOrderCommand(
        purchaseOrderCreationDtoMock,
      );

      // Act
      await controller.createPurchaseOrderAsync(purchaseOrderCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
