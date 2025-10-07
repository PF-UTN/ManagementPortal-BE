import { Prisma } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { DownloadShipmentDto } from '@mp/common/dtos';

import { DownloadShipmentQuery } from './download-shipment.query';
import { DownloadShipmentQueryHandler } from './download-shipment.query.handler';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

describe('DownloadShipmentQueryHandler', () => {
  let handler: DownloadShipmentQueryHandler;
  let shipmentService: jest.Mocked<ShipmentService>;

  beforeEach(() => {
    shipmentService = mockDeep<ShipmentService>();
    handler = new DownloadShipmentQueryHandler(shipmentService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const query = new DownloadShipmentQuery({
      searchText: 'test',
      filters: {
        statusName: ['Pending'],
      },
    });

    it('should call shipmentService.downloadWithFiltersAsync with the query', async () => {
      const shipment: Prisma.ShipmentGetPayload<{
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

      jest
        .spyOn(shipmentService, 'downloadWithFiltersAsync')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(shipment as any);

      await handler.execute(query);

      expect(shipmentService.downloadWithFiltersAsync).toHaveBeenCalledWith(
        query,
      );
    });

    it('should map shipments to DownloadShipmentDto', async () => {
      const shipment: Prisma.ShipmentGetPayload<{
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

      jest
        .spyOn(shipmentService, 'downloadWithFiltersAsync')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(shipment as any);

      const result = await handler.execute(query);

      const expected: DownloadShipmentDto[] = [
        {
          ID: 1,
          Fecha: new Date('2025-10-06T10:00:00Z'),
          Vehiculo: 'AB123CD, Toyota Hilux',
          Estado: 'Finalizado',
          Pedidos_Asociados: '101, 102, 103',
          Kilometros_Estimados: 250,
          Kilometros_Efectivos: 245,
          Link_Ruta: 'https://maps.google.com/?q=route123',
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
