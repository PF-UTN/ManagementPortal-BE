import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { OrderDetailsToClientDto } from '@mp/common/dtos';
import { clientMock } from '@mp/common/testing';

import { AuthenticationService } from './../../../domain/service/authentication/authentication.service';
import { ClientService } from './../../../domain/service/client/client.service';
import { OrderService } from './../../../domain/service/order/order.service';
import { GetOrderByIdForClientQuery } from './get-order-by-id-to-client.query';
import { GetOrderByIdToClientQueryHandler } from './get-order-by-id-to-client.query.handler';

describe('GetOrderByIdToClientQueryHandler', () => {
  let handler: GetOrderByIdToClientQueryHandler;
  let orderService: OrderService;
  let authenticationService: AuthenticationService;
  let clientService: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByIdToClientQueryHandler,
        {
          provide: OrderService,
          useValue: mockDeep<OrderService>(),
        },
        {
          provide: AuthenticationService,
          useValue: mockDeep<AuthenticationService>(),
        },
        {
          provide: ClientService,
          useValue: mockDeep<ClientService>(),
        },
      ],
    }).compile();
    clientService = module.get<ClientService>(ClientService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    orderService = module.get<OrderService>(OrderService);
    handler = module.get<GetOrderByIdToClientQueryHandler>(
      GetOrderByIdToClientQueryHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const token = 'testtoken';
    const authorizationHeader = `Bearer ${token}`;
    const payloadMock = { sub: 1 };

    it('should call findOrderByIdForClientAsync on the service', async () => {
      // Arrange
      const query = new GetOrderByIdForClientQuery(1, authorizationHeader);
      const orderDetailsToClientDtoMock: OrderDetailsToClientDto = {
        id: 1,
        client: {
          companyName: 'Test Company',
          user: {
            firstName: 'Juan',
            lastName: 'Perez',
            email: 'juan@mail.com',
            phone: '123456789',
          },
          address: {
            street: 'Calle Falsa',
            streetNumber: 123,
          },
          taxCategory: {
            name: 'Responsable Inscripto',
            description: '',
          },
        },
        deliveryMethodName: 'Delivery',
        deliveryMethodId: 1,
        orderStatus: {
          name: 'Pending',
        },
        paymentDetail: {
          paymentType: {
            name: 'Efectivo',
          },
        },
        orderItems: [],
        totalAmount: 100,
        createdAt: new Date(),
      };
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);

      jest
        .spyOn(clientService, 'findClientByUserIdAsync')
        .mockResolvedValue(clientMock);

      jest
        .spyOn(orderService, 'findOrderByIdForClientAsync')
        .mockResolvedValueOnce(orderDetailsToClientDtoMock);

      const findOrderByIdForClientAsyncSpy = jest.spyOn(
        orderService,
        'findOrderByIdForClientAsync',
      );

      // Act
      await handler.execute(query);

      // Assert
      expect(findOrderByIdForClientAsyncSpy).toHaveBeenCalledWith(
        1,
        clientMock.id,
      );
    });

    it('should return order details for given id', async () => {
      // Arrange
      const query = new GetOrderByIdForClientQuery(1, authorizationHeader);

      const orderDetailsDtoMock: OrderDetailsToClientDto = {
        id: 1,
        client: {
          companyName: 'Test Company',
          user: {
            firstName: 'Juan',
            lastName: 'Perez',
            email: 'juan@mail.com',
            phone: '123456789',
          },
          address: {
            street: 'Calle Falsa',
            streetNumber: 123,
          },
          taxCategory: {
            name: 'Responsable Inscripto',
            description: '',
          },
        },
        deliveryMethodName: 'Delivery',
        deliveryMethodId: 1,
        orderStatus: {
          name: 'Pending',
        },
        paymentDetail: {
          paymentType: {
            name: 'Efectivo',
          },
        },
        orderItems: [],
        totalAmount: 100,
        createdAt: new Date(),
      };
      jest
        .spyOn(authenticationService, 'decodeTokenAsync')
        .mockResolvedValue(payloadMock);
      jest
        .spyOn(clientService, 'findClientByUserIdAsync')
        .mockResolvedValue(clientMock);
      jest
        .spyOn(orderService, 'findOrderByIdForClientAsync')
        .mockResolvedValueOnce(orderDetailsDtoMock);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(orderDetailsDtoMock);
    });
  });
});
