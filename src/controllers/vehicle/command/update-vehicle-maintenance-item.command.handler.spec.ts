import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { UpdateMaintenanceItemDto } from '@mp/common/dtos';

import { UpdateVehicleMaintenanceItemCommand } from './update-vehicle-maintenance-item.command';
import { UpdateVehicleMaintenanceItemCommandHandler } from './update-vehicle-maintenance-item.command.handler';
import { MaintenanceItemService } from '../../../domain/service/maintenance-item/maintenance-item.service';

describe('UpdateVehicleMaintenanceItemCommandHandler', () => {
  let handler: UpdateVehicleMaintenanceItemCommandHandler;
  let maintenanceItemService: MaintenanceItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateVehicleMaintenanceItemCommandHandler,
        {
          provide: MaintenanceItemService,
          useValue: mockDeep(MaintenanceItemService),
        },
      ],
    }).compile();

    maintenanceItemService = module.get<MaintenanceItemService>(
      MaintenanceItemService,
    );

    handler = module.get<UpdateVehicleMaintenanceItemCommandHandler>(
      UpdateVehicleMaintenanceItemCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call updateMaintenanceItemAsync with correct parameters', async () => {
      // Arrange
      const updateMaintenanceItemDtoMock: UpdateMaintenanceItemDto = {
        description: 'Test Maintenance Item',
      };

      const maintenanceItemMock = {
        id: 1,
        description: 'Test Maintenance Item',
      };

      const command = new UpdateVehicleMaintenanceItemCommand(
        maintenanceItemMock.id,
        updateMaintenanceItemDtoMock,
      );
      const updateMaintenanceItemAsyncSpy = jest
        .spyOn(maintenanceItemService, 'updateMaintenanceItemAsync')
        .mockResolvedValueOnce(maintenanceItemMock);

      // Act
      await handler.execute(command);

      // Assert
      expect(updateMaintenanceItemAsyncSpy).toHaveBeenCalledWith(
        command.maintenanceItemId,
        command.updateMaintenanceItemDto,
      );
    });
  });
});
