import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { shipmentStatusTranslations } from '@mp/common/constants';
import { SearchShipmentResponse } from '@mp/common/dtos';

import { SearchShipmentQuery } from './search-shipment.query';
import { SearchShipmentQueryHandler } from './search-shipment.query.handler';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

describe('SearchShipmentQueryHandler', () => {
  let handler: SearchShipmentQueryHandler;
  let shipmentService: ShipmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchShipmentQueryHandler,
        {
          provide: ShipmentService,
          useValue: mockDeep(ShipmentService),
        },
      ],
    }).compile();

    handler = module.get<SearchShipmentQueryHandler>(
      SearchShipmentQueryHandler,
    );
    shipmentService = module.get<ShipmentService>(ShipmentService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call searchWithFiltersAsync on the service with correct parameters', async () => {
    //Arrange
    const query = new SearchShipmentQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
      filters: {
        statusName: ['Pending'],
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
      },
    });

    jest
      .spyOn(shipmentService, 'searchWithFiltersAsync')
      .mockResolvedValue({ data: [], total: 0 });

    //Act
    await handler.execute(query);

    //Assert
    expect(shipmentService.searchWithFiltersAsync).toHaveBeenCalledWith(query);
  });

  it('should map the response correctly', async () => {
    //Arrange
    const query = new SearchShipmentQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
      filters: {
        statusName: ['Pending'],
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
      },
    });

    const result: Prisma.ShipmentGetPayload<{
      include: {
        vehicle: {
          select: {
            id: true;
            licensePlate: true;
            brand: true;
            model: true;
          };
        };
        status: {
          select: {
            id: true;
            name: true;
          };
        };
        orders: {
          select: {
            id: true;
          };
        };
      };
    }>[] = [
      {
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
        orders: [{ id: 101 }, { id: 102 }, { id: 103 }],
      },
    ];

    const expectedTotal = 20;

    const expectedResponse = new SearchShipmentResponse({
      total: expectedTotal,
      results: result.map((shipment) => ({
        id: shipment.id,
        date: shipment.date,
        vehicle: {
          id: shipment.vehicle.id,
          licensePlate: shipment.vehicle.licensePlate,
          brand: shipment.vehicle.brand,
          model: shipment.vehicle.model,
        },
        status: shipmentStatusTranslations[shipment.status.name],
        orders: shipment.orders.map((order) => order.id),
        estimatedKm: shipment.estimatedKm ? Number(shipment.estimatedKm) : null,
        effectiveKm: shipment.effectiveKm ? Number(shipment.effectiveKm) : null,
        routeLink: shipment.routeLink,
      })),
    });

    jest
      .spyOn(shipmentService, 'searchWithFiltersAsync')
      .mockResolvedValue({ data: result, total: expectedTotal });

    //Act
    const response = await handler.execute(query);

    //Assert
    expect(response).toEqual(expectedResponse);
  });
});
