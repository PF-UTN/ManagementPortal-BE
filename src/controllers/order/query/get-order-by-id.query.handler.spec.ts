import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { OrderDetailsDto } from '@mp/common/dtos';

import { OrderService } from './../../../domain/service/order/order.service';
import { GetOrderByIdQuery } from './get-order-by-id.query';
import { GetOrderByIdQueryHandler } from './get-order-by-id.query.handler';

describe('GetOrderByIdQueryHandler', () => {
  let handler: GetOrderByIdQueryHandler;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByIdQueryHandler,
        {
          provide: OrderService,
          useValue: mockDeep<OrderService>(),
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    handler = module.get<GetOrderByIdQueryHandler>(GetOrderByIdQueryHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call findOrderByIdAsync on the service', async () => {
      // Arrange
      const query = new GetOrderByIdQuery(1);

      const orderDetailsDtoMock: OrderDetailsDto = {
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
        .spyOn(orderService, 'findOrderByIdAsync')
        .mockResolvedValueOnce(orderDetailsDtoMock);

      const findOrderByIdAsyncSpy = jest.spyOn(
        orderService,
        'findOrderByIdAsync',
      );

      // Act
      await handler.execute(query);

      // Assert
      expect(findOrderByIdAsyncSpy).toHaveBeenCalledWith(1);
    });

    it('should return order details for given id', async () => {
      // Arrange
      const query = new GetOrderByIdQuery(1);

      const orderDetailsDtoMock: OrderDetailsDto = {
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
        .spyOn(orderService, 'findOrderByIdAsync')
        .mockResolvedValueOnce(orderDetailsDtoMock);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(orderDetailsDtoMock);
    });
  });
});
