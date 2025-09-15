import { Test, TestingModule } from '@nestjs/testing';
import { Maintenance } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { UpdateMaintenanceDto } from '@mp/common/dtos';

import { UpdateVehicleMaintenanceCommand } from './update-vehicle-maintenance.command';
import { UpdateVehicleMaintenanceCommandHandler } from './update-vehicle-maintenance.command.handler';
import { MaintenanceService } from '../../../domain/service/maintenance/maintenance.service';

describe('UpdateMaintenanceCommandHandler', () => {
  let handler: UpdateVehicleMaintenanceCommandHandler;
  let maintenanceService: MaintenanceService;
  let maintenance: ReturnType<typeof mockDeep<Maintenance>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateVehicleMaintenanceCommandHandler,
        {
          provide: MaintenanceService,
          useValue: mockDeep(MaintenanceService),
        },
      ],
    }).compile();

    maintenanceService = module.get<MaintenanceService>(MaintenanceService);

    handler = module.get<UpdateVehicleMaintenanceCommandHandler>(
      UpdateVehicleMaintenanceCommandHandler,
    );

    maintenance = mockDeep<Maintenance>();

    maintenance.id = 1;
    maintenance.date = mockDeep<Date>();
    maintenance.kmPerformed = 20000;
    maintenance.maintenancePlanItemId = 1;
    maintenance.serviceSupplierId = 1;
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call updateMaintenanceAsync with correct parameters', async () => {
      // Arrange
      const maintenanceId = maintenance.id;
      const updateMaintenanceDtoMock: UpdateMaintenanceDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      const command = new UpdateVehicleMaintenanceCommand(
        maintenanceId,
        updateMaintenanceDtoMock,
      );
      const updateMaintenanceAsyncSpy = jest
        .spyOn(maintenanceService, 'updateMaintenanceAsync')
        .mockResolvedValueOnce(maintenance);

      // Act
      await handler.execute(command);

      // Assert
      expect(updateMaintenanceAsyncSpy).toHaveBeenCalledWith(
        command.maintenanceId,
        command.updateMaintenanceDto,
      );
    });
  });
});
