import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { DeliveryMethodId, OrderStatusId } from '@mp/common/constants';
import { GetShipmentByIdDto } from '@mp/common/dtos';

import { GetShipmentByIdQuery } from './get-shipment-by-id.query';
import { GetShipmentByIdQueryHandler } from './get-shipment-by-id.query.handler';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

describe('GetShipmentByIdQueryHandler', () => {
  let handler: GetShipmentByIdQueryHandler;
  let shipmentService: ShipmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetShipmentByIdQueryHandler,
        {
          provide: ShipmentService,
          useValue: mockDeep(ShipmentService),
        },
      ],
    }).compile();

    shipmentService = module.get<ShipmentService>(ShipmentService);

    handler = module.get<GetShipmentByIdQueryHandler>(
      GetShipmentByIdQueryHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const query = new GetShipmentByIdQuery(1);
    const shipmentMock = {
      id: 1,
      date: new Date('2025-10-06T10:00:00Z'),
      estimatedKm: new Prisma.Decimal(250),
      effectiveKm: new Prisma.Decimal(245),
      finishedAt: new Date('2025-10-06T18:00:00Z'),
      routeLink: 'https://maps.google.com/?q=route123',
      vehicleId: 5,
      vehicle: {
        id: 5,
        licensePlate: 'AB123CD',
        brand: 'Toyota',
        model: 'Hilux',
      },
      statusId: 3,
      status: {
        id: 3,
        name: 'Finished',
      },
      orders: [
        {
          id: 101,
          orderStatusId: OrderStatusId.Prepared,
          clientId: 1,
          client: {
            id: 1,
            companyName: 'test client',
            addressId: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'test-client@test.com',
            },
          },
          createdAt: new Date('2025-10-06T09:00:00Z'),
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: new Prisma.Decimal(200.5),
        },
        {
          id: 102,
          orderStatusId: OrderStatusId.Prepared,
          clientId: 1,
          client: {
            id: 1,
            companyName: 'test client',
            addressId: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'test-client@test.com',
            },
          },
          createdAt: new Date('2025-10-06T09:15:00Z'),
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: new Prisma.Decimal(300.75),
        },
        {
          id: 103,
          orderStatusId: OrderStatusId.Prepared,
          clientId: 1,
          client: {
            id: 1,
            companyName: 'test client',
            addressId: 1,
            taxCategoryId: 1,
            userId: 1,
            user: {
              email: 'test-client@test.com',
            },
          },
          createdAt: new Date('2025-10-06T09:30:00Z'),
          deliveryMethodId: DeliveryMethodId.HomeDelivery,
          paymentDetailId: 1,
          shipmentId: 1,
          totalAmount: new Prisma.Decimal(150.25),
        },
      ],
    };

    it('should call findByIdAsync on the service', async () => {
      // Arrange
      jest
        .spyOn(shipmentService, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      const findShipmentByIdAsyncSpy = jest.spyOn(
        shipmentService,
        'findByIdAsync',
      );

      // Act
      await handler.execute(query);

      // Assert
      expect(findShipmentByIdAsyncSpy).toHaveBeenCalled();
    });

    it('should map the response correctly', async () => {
      // Arrange
      jest
        .spyOn(shipmentService, 'findByIdAsync')
        .mockResolvedValueOnce(shipmentMock);

      const expectedResponse: GetShipmentByIdDto = {
        id: 1,
        date: new Date('2025-10-06T10:00:00Z'),
        estimatedKm: 250,
        effectiveKm: 245,
        finishedAt: new Date('2025-10-06T18:00:00Z'),
        routeLink: 'https://maps.google.com/?q=route123',
        vehicle: {
          id: 5,
          licensePlate: 'AB123CD',
          brand: 'Toyota',
          model: 'Hilux',
        },
        status: 'Finished',
        orders: [101, 102, 103],
      };

      //Act
      const response = await handler.execute(query);

      //Assert
      expect(response).toEqual(expectedResponse);
    });
  });
});
