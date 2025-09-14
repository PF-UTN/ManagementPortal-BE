/* eslint-disable @typescript-eslint/no-explicit-any */
import { StreamableFile } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

import { DownloadVehiclesMaintenanceQuery } from './download-vehicles-maintenance-query';
import { DownloadVehiclesMaintenanceQueryHandler } from './download-vehicles-maintenance.query.handler';
import {
  ExcelExportHelper,
  DateHelper,
} from '../../../../libs/common/src/helpers';
import { MaintenanceService } from '../../../domain/service/maintenance/maintenance.service';
import { RepairService } from '../../../domain/service/repair/repair.service';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

describe('DownloadVehiclesMaintenanceQueryHandler', () => {
  let handler: DownloadVehiclesMaintenanceQueryHandler;
  let vehicleService: VehicleService;
  let maintenanceService: MaintenanceService;
  let repairService: RepairService;

  beforeEach(() => {
    vehicleService = mockDeep<VehicleService>();
    maintenanceService = mockDeep<MaintenanceService>();
    repairService = mockDeep<RepairService>();

    handler = new DownloadVehiclesMaintenanceQueryHandler(
      vehicleService,
      maintenanceService,
      repairService,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const vehicleId = 1;
    const query = new DownloadVehiclesMaintenanceQuery(vehicleId);

    let vehicleMock: { id: number; licensePlate: string };
    let maintenanceMock: Array<{
      id: number;
      date: Date;
      kmPerformed: number;
      serviceSupplier: { businessName: string; email: string; phone: string };
      maintenancePlanItem: {
        id: number;
        kmInterval: number | null;
        timeInterval: number | null;
        maintenanceItem: { id: number; description: string };
      };
    }>;
    let repairsMock: Array<{
      id: number;
      date: Date;
      description: string;
      kmPerformed: number;
      serviceSupplier: { businessName: string; email: string; phone: string };
    }>;

    beforeEach(() => {
      vehicleMock = { id: vehicleId, licensePlate: 'AB123CD' };

      maintenanceMock = [
        {
          id: 10,
          date: new Date('2025-09-10'),
          kmPerformed: 1000,
          serviceSupplier: {
            businessName: 'Supplier A',
            email: 'suppliera@test.com',
            phone: '12345678',
          },
          maintenancePlanItem: {
            id: 1,
            kmInterval: 5000,
            timeInterval: 6,
            maintenanceItem: { id: 100, description: 'Cambio de aceite' },
          },
        },
      ];

      repairsMock = [
        {
          id: 20,
          date: new Date('2025-09-12'),
          description: 'Cambio de frenos',
          kmPerformed: 1500,
          serviceSupplier: {
            businessName: 'Supplier B',
            email: 'supplierb@test.com',
            phone: '87654321',
          },
        },
      ];

      jest
        .spyOn(vehicleService, 'findByIdAsync')
        .mockResolvedValue(vehicleMock as any);
      jest
        .spyOn(maintenanceService, 'findByVehicleIdAsync')
        .mockResolvedValue(maintenanceMock as any);
      jest
        .spyOn(repairService, 'findByVehicleIdAsync')
        .mockResolvedValue(repairsMock as any);
      jest
        .spyOn(ExcelExportHelper, 'exportToMultipleExcelBuffers')
        .mockImplementation(() => Buffer.from('test'));
      jest.spyOn(DateHelper, 'formatYYYYMMDD').mockReturnValue('20250911');
    });

    it('should return a StreamableFile with correct properties', async () => {
      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(StreamableFile);
      expect(result.options.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(result.options.length).toBe(Buffer.from('test').length);
      expect(result.options.disposition).toBe(
        'attachment; filename="20250911 - Listado Mantenimiento y Reparacion - AB123CD"',
      );
    });
  });
});
