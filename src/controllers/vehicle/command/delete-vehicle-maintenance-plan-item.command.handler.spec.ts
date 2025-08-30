import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DeleteVehicleMaintenancePlanItemCommand } from './delete-vehicle-maintenance-plan-item.command';
import { DeleteVehicleMaintenancePlanItemCommandHandler } from './delete-vehicle-maintenance-plan-item.command.handler';
import { MaintenancePlanItemService } from '../../../domain/service/maintenance-plan-item/maintenance-plan-item.service';

describe('DeleteVehicleMaintenancePlanItemCommandHandler', () => {
  let handler: DeleteVehicleMaintenancePlanItemCommandHandler;
  let maintenancePlanItemService: MaintenancePlanItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteVehicleMaintenancePlanItemCommandHandler,
        {
          provide: MaintenancePlanItemService,
          useValue: mockDeep(MaintenancePlanItemService),
        },
      ],
    }).compile();

    maintenancePlanItemService = module.get<MaintenancePlanItemService>(
      MaintenancePlanItemService,
    );

    handler = module.get<DeleteVehicleMaintenancePlanItemCommandHandler>(
      DeleteVehicleMaintenancePlanItemCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call deleteMaintenancePlanItemAsync with correct parameters', async () => {
    // Arrange
    const command = new DeleteVehicleMaintenancePlanItemCommand(1);
    const deleteVehicleAsyncSpy = jest.spyOn(
      maintenancePlanItemService,
      'deleteMaintenancePlanItemAsync',
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(deleteVehicleAsyncSpy).toHaveBeenCalledWith(
      command.maintenancePlanItemId,
    );
  });
});
