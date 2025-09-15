import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DeleteVehicleMaintenanceCommand } from './delete-vehicle-maintenance.command';
import { DeleteVehicleMaintenanceCommandHandler } from './delete-vehicle-maintenance.command.handler';
import { MaintenanceService } from '../../../domain/service/maintenance/maintenance.service';

describe('DeleteVehicleMaintenanceCommandHandler', () => {
  let handler: DeleteVehicleMaintenanceCommandHandler;
  let maintenanceService: MaintenanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteVehicleMaintenanceCommandHandler,
        {
          provide: MaintenanceService,
          useValue: mockDeep(MaintenanceService),
        },
      ],
    }).compile();

    maintenanceService = module.get<MaintenanceService>(MaintenanceService);

    handler = module.get<DeleteVehicleMaintenanceCommandHandler>(
      DeleteVehicleMaintenanceCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call deleteMaintenanceAsync with correct parameters', async () => {
    // Arrange
    const command = new DeleteVehicleMaintenanceCommand(1);
    const deleteVehicleAsyncSpy = jest.spyOn(
      maintenanceService,
      'deleteMaintenanceAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(deleteVehicleAsyncSpy).toHaveBeenCalledWith(command.maintenanceId);
  });
});
