import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DeliveryMethodId, OrderStatusId } from '@mp/common/constants';
import {
  OrderCreationDto,
  SearchOrderFromClientRequest,
} from '@mp/common/dtos';

import { CreateOrderCommand } from './command/create-order.command';
import { OrderController } from './order.controller';
import { GetOrderByIdToClientQuery } from './query/get-order-by-id-to-client.query';
import { GetOrderByIdQuery } from './query/get-order-by-id.query';
import { SearchOrderFromClientQuery } from './query/search-order.query';

describe('OrderController', () => {
  let controller: OrderController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockDeep(CommandBus),
        },
        { provide: QueryBus, useValue: mockDeep(QueryBus) },
      ],
    }).compile();

    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPurchaseOrderAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const orderCreationDtoMock: OrderCreationDto = {
        clientId: 1,
        orderStatusId: OrderStatusId.Pending,
        paymentDetail: {
          paymentTypeId: 1,
        },
        deliveryMethodId: DeliveryMethodId.HomeDelivery,
        orderItems: [
          {
            productId: 1,
            quantity: 10,
            unitPrice: 10.5,
          },
        ],
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateOrderCommand(orderCreationDtoMock);

      // Act
      await controller.createOrderAsync(orderCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
  describe('searchOrdersFromClientAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const authorizationHeader = 'Bearer testtoken';
      const searchOrderFromClientRequestMock: SearchOrderFromClientRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: {},
        orderBy: undefined,
      };
      const executeSpy = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValue('result');
      const expectedQuery = new SearchOrderFromClientQuery(
        searchOrderFromClientRequestMock,
        authorizationHeader,
      );

      // Act
      await controller.searchOrdersFromClientAsync(
        authorizationHeader,
        searchOrderFromClientRequestMock,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('getOrderByIdAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const orderId = 1;
      const executeSpy = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValue('result');
      const expectedQuery = new GetOrderByIdQuery(orderId);

      // Act
      await controller.getOrderByIdAsync(orderId);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('getOrderByIdToClientAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const orderId = 1;
      const executeSpy = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValue('result');
      const expectedQuery = new GetOrderByIdToClientQuery(orderId);

      // Act
      await controller.getOrderByIdToClientAsync(orderId);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedQuery);
    });
  });
});
