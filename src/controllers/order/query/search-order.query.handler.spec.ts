import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { clientMock, SearchOrderFromClientResponse } from '@mp/common/dtos';
import { orderBigMock } from '@mp/common/testing';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { ClientService } from './../../../domain/service/client/client.service';
import { OrderService } from './../../../domain/service/order/order.service';
import { SearchOrderFromClientQuery } from './search-order.query';
import { SearchOrderFromClientQueryHandler } from './search-order.query.handler';

describe('SearchOrderQueryHandler', () => {
  let handler: SearchOrderFromClientQueryHandler;
  let orderService: OrderService;
  let authenticationService: AuthenticationService;
  let clientService: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchOrderFromClientQueryHandler,
        { provide: OrderService, useValue: mockDeep<OrderService>() },
        {
          provide: AuthenticationService,
          useValue: mockDeep<AuthenticationService>(),
        },
        { provide: ClientService, useValue: mockDeep<ClientService>() },
      ],
    }).compile();

    handler = module.get<SearchOrderFromClientQueryHandler>(
      SearchOrderFromClientQueryHandler,
    );
    orderService = module.get<OrderService>(OrderService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    clientService = module.get<ClientService>(ClientService);
  });

  describe('execute', () => {
    const token = 'testtoken';
    const authorizationHeader = `Bearer ${token}`;
    const payloadMock = { sub: 1 };

    const request = {
      searchText: 'test',
      page: 1,
      pageSize: 10,
      filters: {},
      orderBy: undefined,
    };

    let query: SearchOrderFromClientQuery;

    beforeEach(() => {
      query = new SearchOrderFromClientQuery(request, authorizationHeader);
    });

    it('should call authenticationService.decodeTokenAsync with the token extracted from authorizationHeader', async () => {
      // Arrange
      const decodeSpy = jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest
        .spyOn(clientService, 'findClientByUserIdAsync')
        .mockResolvedValue(clientMock);
      jest
        .spyOn(orderService, 'searchClientOrdersWithFiltersAsync')
        .mockResolvedValue({
          data: [orderBigMock],
          total: 1,
        });

      // Act
      await handler.execute(query);

      // Assert
      expect(decodeSpy).toHaveBeenCalledWith(token);
    });

    it('should call clientService.findClientByUserIdAsync with the userId from payload', async () => {
      // Arrange
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      const clientSpy = jest
        .spyOn(clientService, 'findClientByUserIdAsync')
        .mockResolvedValue(clientMock);
      jest
        .spyOn(orderService, 'searchClientOrdersWithFiltersAsync')
        .mockResolvedValue({
          data: [orderBigMock],
          total: 1,
        });

      // Act
      await handler.execute(query);

      // Assert
      expect(clientSpy).toHaveBeenCalledWith(payloadMock.sub);
    });

    it('should call orderService.searchClientOrdersWithFiltersAsync with correct params', async () => {
      // Arrange
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest
        .spyOn(clientService, 'findClientByUserIdAsync')
        .mockResolvedValue(clientMock);
      const orderSpy = jest
        .spyOn(orderService, 'searchClientOrdersWithFiltersAsync')
        .mockResolvedValue({
          data: [orderBigMock],
          total: 1,
        });

      // Act
      await handler.execute(query);

      // Assert
      expect(orderSpy).toHaveBeenCalledWith({
        clientId: clientMock.id,
        searchText: query.searchText,
        page: query.page,
        pageSize: query.pageSize,
        filters: query.filters,
        orderBy: query.orderBy,
      });
    });

    it('should return instance of SearchOrderFromClientResponse', async () => {
      // Arrange
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest
        .spyOn(clientService, 'findClientByUserIdAsync')
        .mockResolvedValue(clientMock);
      jest
        .spyOn(orderService, 'searchClientOrdersWithFiltersAsync')
        .mockResolvedValue({
          data: [orderBigMock],
          total: 1,
        });

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeInstanceOf(SearchOrderFromClientResponse);
    });

    it('should return correct total in response', async () => {
      // Arrange
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest
        .spyOn(clientService, 'findClientByUserIdAsync')
        .mockResolvedValue(clientMock);
      jest
        .spyOn(orderService, 'searchClientOrdersWithFiltersAsync')
        .mockResolvedValue({
          data: [orderBigMock],
          total: 1,
        });

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.total).toBe(1);
    });

    it('should map order to correct dto', async () => {
      // Arrange
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest
        .spyOn(clientService, 'findClientByUserIdAsync')
        .mockResolvedValue(clientMock);
      jest
        .spyOn(orderService, 'searchClientOrdersWithFiltersAsync')
        .mockResolvedValue({
          data: [orderBigMock],
          total: 1,
        });

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.results[0]).toMatchObject({
        id: 1,
        orderStatusName: expect.any(String),
        createdAt: expect.any(Date),
        totalAmount: 100,
        productsCount: 2,
      });
    });

    it('should throw NotFoundException if client does not exist', async () => {
      // Arrange
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest
        .spyOn(clientService, 'findClientByUserIdAsync')
        .mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });
  });
});
