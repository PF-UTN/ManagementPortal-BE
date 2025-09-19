import { Test, TestingModule } from '@nestjs/testing';
import { Maintenance } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { MaintenanceCreationDto } from '@mp/common/dtos';

import { CreateVehicleMaintenanceCommand } from './create-vehicle-maintenance.command';
import { CreateVehicleMaintenanceCommandHandler } from './create-vehicle-maintenance.command.handler';
import { MaintenanceService } from '../../../domain/service/maintenance/maintenance.service';

describe('CreateMaintenanceCommandHandler', () => {
  let handler: CreateVehicleMaintenanceCommandHandler;
  let maintenanceService: MaintenanceService;
  let maintenance: ReturnType<typeof mockDeep<Maintenance>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVehicleMaintenanceCommandHandler,
        {
          provide: MaintenanceService,
          useValue: mockDeep(MaintenanceService),
        },
      ],
    }).compile();

    maintenanceService = module.get<MaintenanceService>(MaintenanceService);

    handler = module.get<CreateVehicleMaintenanceCommandHandler>(
      CreateVehicleMaintenanceCommandHandler,
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
    it('should call createMaintenanceAsync with correct parameters', async () => {
      // Arrange
      const vehicleId = 1;
      const maintenanceCreationDtoMock: MaintenanceCreationDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        maintenancePlanItemId: maintenance.maintenancePlanItemId,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      const command = new CreateVehicleMaintenanceCommand(
        vehicleId,
        maintenanceCreationDtoMock,
      );
      const createMaintenanceAsyncSpy = jest
        .spyOn(maintenanceService, 'createMaintenanceAsync')
        .mockResolvedValueOnce(maintenance);

      // Act
      await handler.execute(command);

      // Assert
      expect(createMaintenanceAsyncSpy).toHaveBeenCalledWith(
        command.vehicleId,
        command.maintenanceCreationDto,
      );
    });
  });
});
