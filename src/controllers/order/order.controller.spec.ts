import { StreamableFile } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import {
  DeliveryMethodId,
  OrderDirection,
  OrderField,
  OrderStatusId,
} from '@mp/common/constants';
import {
  DownloadOrderRequest,
  OrderCreationDto,
  SearchOrderFromClientRequest,
  SearchOrderRequest,
} from '@mp/common/dtos';
import { DateHelper, ExcelExportHelper } from '@mp/common/helpers';

import { CreateOrderCommand } from './command/create-order.command';
import { OrderController } from './order.controller';
import { CheckoutOrderQuery } from './query/checkout-order.query';
import { DownloadOrderQuery } from './query/download-order.query';
import { GetOrderByIdForClientQuery } from './query/get-order-by-id-to-client.query';
import { GetOrderByIdQuery } from './query/get-order-by-id.query';
import { SearchOrderFromClientQuery } from './query/search-order-from-client.query';
import { SearchOrderQuery } from './query/search-order.query';

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

  describe('createOrderAsync', () => {
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
      const authorizationHeader = 'Bearer testtoken';
      const executeSpy = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValue('result');
      const expectedQuery = new GetOrderByIdForClientQuery(
        orderId,
        authorizationHeader,
      );

      // Act
      await controller.getOrderByIdToClientAsync(orderId, authorizationHeader);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('searchOrdersAsync', () => {
    it('should call queryBus.execute with SearchOrderQuery and correct params', async () => {
      // Arrange
      const request: SearchOrderRequest = {
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
      };
      // Act
      await controller.searchOrdersAsync(request);
      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchOrderQuery(request),
      );
    });
  });

  describe('downloadOrdersAsync', () => {
    const downloadOrderRequest: DownloadOrderRequest = {
      searchText: 'test',
      filters: {
        statusName: ['Pending'],
      },
    };

    const buffer = Buffer.from('test');
    const expectedFilename = `${DateHelper.formatYYYYMMDD(
      new Date(),
    )} - Listado Pedidos`;

    beforeEach(async () => {
      jest
        .spyOn(ExcelExportHelper, 'exportToExcelBuffer')
        .mockReturnValue(buffer);
    });

    it('should call queryBus.execute with DownloadOrderQuery', async () => {
      await controller.downloadOrdersAsync(downloadOrderRequest);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new DownloadOrderQuery(downloadOrderRequest),
      );
    });

    it('should call ExcelExportHelper.exportToExcelBuffer with orders', async () => {
      await controller.downloadOrdersAsync(downloadOrderRequest);
      expect(ExcelExportHelper.exportToExcelBuffer).toHaveBeenCalled();
    });

    it('should return a StreamableFile', async () => {
      const result = await controller.downloadOrdersAsync(downloadOrderRequest);
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should set the correct filename in the disposition', async () => {
      const result = await controller.downloadOrdersAsync(downloadOrderRequest);
      expect(result.options.disposition).toBe(
        `attachment; filename="${expectedFilename}"`,
      );
    });

    it('should set the correct content type', async () => {
      const result = await controller.downloadOrdersAsync(downloadOrderRequest);
      expect(result.options.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should set the correct length', async () => {
      const result = await controller.downloadOrdersAsync(downloadOrderRequest);
      expect(result.options.length).toBe(buffer.length);
    });
  });

  describe('checkoutAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const orderId = 123;
      const authorizationHeader = 'Bearer testtoken';
      const executeSpy = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValue('checkoutResult');
      const expectedQuery = new CheckoutOrderQuery(
        orderId,
        authorizationHeader,
      );

      // Act
      const result = await controller.checkoutAsync(
        orderId,
        authorizationHeader,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedQuery);
      expect(result).toBe('checkoutResult');
    });
  });
});
