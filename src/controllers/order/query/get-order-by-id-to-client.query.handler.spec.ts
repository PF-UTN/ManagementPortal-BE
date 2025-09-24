import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { OrderDetailsToClientDto } from '@mp/common/dtos';

import { OrderService } from './../../../domain/service/order/order.service';
import { GetOrderByIdToClientQuery } from './get-order-by-id-to-client.query';
import { GetOrderByIdToClientQueryHandler } from './get-order-by-id-to-client.query.handler';

describe('GetOrderByIdToClientQueryHandler', () => {
  let handler: GetOrderByIdToClientQueryHandler;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByIdToClientQueryHandler,
        {
          provide: OrderService,
          useValue: mockDeep<OrderService>(),
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    handler = module.get<GetOrderByIdToClientQueryHandler>(
      GetOrderByIdToClientQueryHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call findOrderByIdAsync on the service', async () => {
      // Arrange
      const query = new GetOrderByIdToClientQuery(1);

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
        .spyOn(orderService, 'findOrderByIdToClientAsync')
        .mockResolvedValueOnce(orderDetailsToClientDtoMock);

      const findOrderByIdToClientAsyncSpy = jest.spyOn(
        orderService,
        'findOrderByIdToClientAsync',
      );

      // Act
      await handler.execute(query);

      // Assert
      expect(findOrderByIdToClientAsyncSpy).toHaveBeenCalledWith(1);
    });

    it('should return order details for given id', async () => {
      // Arrange
      const query = new GetOrderByIdToClientQuery(1);

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
        .spyOn(orderService, 'findOrderByIdToClientAsync')
        .mockResolvedValueOnce(orderDetailsDtoMock);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(orderDetailsDtoMock);
    });
  });
});
