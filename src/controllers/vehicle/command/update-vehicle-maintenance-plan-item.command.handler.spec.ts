import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { UpdateMaintenancePlanItemDto } from '@mp/common/dtos';

import { UpdateVehicleMaintenancePlanItemCommand } from './update-vehicle-maintenance-plan-item.command';
import { UpdateVehicleMaintenancePlanItemCommandHandler } from './update-vehicle-maintenance-plan-item.command.handler';
import { MaintenancePlanItemService } from '../../../domain/service/maintenance-plan-item/maintenance-plan-item.service';

describe('UpdateVehicleMaintenancePlanItemCommandHandler', () => {
  let handler: UpdateVehicleMaintenancePlanItemCommandHandler;
  let maintenancePlanItemService: MaintenancePlanItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateVehicleMaintenancePlanItemCommandHandler,
        {
          provide: MaintenancePlanItemService,
          useValue: mockDeep(MaintenancePlanItemService),
        },
      ],
    }).compile();

    maintenancePlanItemService = module.get<MaintenancePlanItemService>(
      MaintenancePlanItemService,
    );

    handler = module.get<UpdateVehicleMaintenancePlanItemCommandHandler>(
      UpdateVehicleMaintenancePlanItemCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should throw BadRequestException if neither kmInterval nor timeInterval is provided', async () => {
      // Arrange
      const updateMaintenancePlanItemDtoMock: UpdateMaintenancePlanItemDto = {
        maintenanceItemId: 1,
        kmInterval: null,
        timeInterval: null,
      };

      const command = new UpdateVehicleMaintenancePlanItemCommand(
        1,
        updateMaintenancePlanItemDtoMock,
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call updateMaintenancePlanItemAsync with correct parameters', async () => {
      // Arrange
      const updateMaintenancePlanItemDtoMock: UpdateMaintenancePlanItemDto = {
        maintenanceItemId: 1,
        kmInterval: 15000,
        timeInterval: null,
      };

      const maintenancePlanItemMock = {
        id: 1,
        maintenanceItemId: updateMaintenancePlanItemDtoMock.maintenanceItemId,
        vehicleId: 1,
        kmInterval: updateMaintenancePlanItemDtoMock.kmInterval,
        timeInterval: updateMaintenancePlanItemDtoMock.timeInterval,
      };

      const command = new UpdateVehicleMaintenancePlanItemCommand(
        maintenancePlanItemMock.id,
        updateMaintenancePlanItemDtoMock,
      );
      const updateMaintenancePlanItemAsyncSpy = jest
        .spyOn(maintenancePlanItemService, 'updateMaintenancePlanItemAsync')
        .mockResolvedValueOnce(maintenancePlanItemMock);

      // Act
      await handler.execute(command);

      // Assert
      expect(updateMaintenancePlanItemAsyncSpy).toHaveBeenCalledWith(
        command.maintenancePlanItemId,
        command.updateMaintenancePlanItemDto,
      );
    });
  });
});
