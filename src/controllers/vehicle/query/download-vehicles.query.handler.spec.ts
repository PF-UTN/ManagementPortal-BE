import { mockDeep } from 'jest-mock-extended';

import { DownloadVehicleDto } from '@mp/common/dtos';

import { DownloadVehiclesQuery } from './download-vehicles-query';
import { DownloadVehiclesQueryHandler } from './download-vehicles.query.handler';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

describe('DownloadVehiclesQueryHandler', () => {
  let handler: DownloadVehiclesQueryHandler;
  let vehicleService: jest.Mocked<VehicleService>;

  beforeEach(() => {
    vehicleService = mockDeep<VehicleService>();
    handler = new DownloadVehiclesQueryHandler(vehicleService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const query = new DownloadVehiclesQuery({
      searchText: 'ABC123',
    });

    const vehicles = [
      {
        id: 1,
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 150000,
        admissionDate: new Date('2025-01-10'),
        enabled: true,
      },
      {
        id: 2,
        licensePlate: 'XYZ789',
        brand: 'Ford',
        model: 'Focus',
        kmTraveled: 90000,
        admissionDate: new Date('2024-05-20'),
        enabled: false,
      },
    ];

    it('should call vehicleService.downloadBySearchTextAsync with the query.searchText', async () => {
      // Arrange
      jest
        .spyOn(vehicleService, 'downloadBySearchTextAsync')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(vehicles as any);

      // Act
      await handler.execute(query);

      // Assert
      expect(vehicleService.downloadBySearchTextAsync).toHaveBeenCalledWith(
        query.searchText,
      );
    });

    it('should map vehicles to DownloadVehicleDto', async () => {
      // Arrange
      jest
        .spyOn(vehicleService, 'downloadBySearchTextAsync')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(vehicles as any);

      // Act
      const result = await handler.execute(query);

      // Assert
      const expected: DownloadVehicleDto[] = [
        {
          ID: 1,
          Patente: 'ABC123',
          Marca: 'Toyota',
          Modelo: 'Corolla',
          Kilometros_Recorridos: 150000,
          Fecha_Admisión: new Date('2025-01-10'),
          Habilitado: 'Sí',
        },
        {
          ID: 2,
          Patente: 'XYZ789',
          Marca: 'Ford',
          Modelo: 'Focus',
          Kilometros_Recorridos: 90000,
          Fecha_Admisión: new Date('2024-05-20'),
          Habilitado: 'No',
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
