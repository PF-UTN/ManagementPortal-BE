import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { MaintenancePlanItemCreationDto } from '@mp/common/dtos';

import { CreateVehicleMaintenancePlanItemCommand } from './create-vehicle-maintenance-plan-item.command';
import { CreateVehicleMaintenancePlanItemCommandHandler } from './create-vehicle-maintenance-plan-item.command.handler';
import { MaintenancePlanItemService } from '../../../domain/service/maintenance-plan-item/maintenance-plan-item.service';

describe('CreateMaintenancePlanItemCommandHandler', () => {
  let handler: CreateVehicleMaintenancePlanItemCommandHandler;
  let maintenancePlanItemService: MaintenancePlanItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVehicleMaintenancePlanItemCommandHandler,
        {
          provide: MaintenancePlanItemService,
          useValue: mockDeep(MaintenancePlanItemService),
        },
      ],
    }).compile();

    maintenancePlanItemService = module.get<MaintenancePlanItemService>(
      MaintenancePlanItemService,
    );

    handler = module.get<CreateVehicleMaintenancePlanItemCommandHandler>(
      CreateVehicleMaintenancePlanItemCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should throw BadRequestException if neither kmInterval nor timeInterval is provided', async () => {
      // Arrange
      const maintenancePlanItemCreationDtoMock: MaintenancePlanItemCreationDto =
        {
          maintenanceItemId: 1,
          vehicleId: 1,
          kmInterval: null,
          timeInterval: null,
        };

      const command = new CreateVehicleMaintenancePlanItemCommand(
        maintenancePlanItemCreationDtoMock,
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call createMaintenancePlanItemAsync with correct parameters', async () => {
      // Arrange
      const maintenancePlanItemCreationDtoMock: MaintenancePlanItemCreationDto =
        {
          maintenanceItemId: 1,
          vehicleId: 1,
          kmInterval: 10000,
          timeInterval: 6,
        };

      const maintenancePlanItemMock = {
        id: 1,
        maintenanceItemId: maintenancePlanItemCreationDtoMock.maintenanceItemId,
        vehicleId: maintenancePlanItemCreationDtoMock.vehicleId,
        kmInterval: maintenancePlanItemCreationDtoMock.kmInterval,
        timeInterval: maintenancePlanItemCreationDtoMock.timeInterval,
      };

      const command = new CreateVehicleMaintenancePlanItemCommand(
        maintenancePlanItemCreationDtoMock,
      );
      const createMaintenancePlanItemAsyncSpy = jest
        .spyOn(maintenancePlanItemService, 'createMaintenancePlanItemAsync')
        .mockResolvedValueOnce(maintenancePlanItemMock);

      // Act
      await handler.execute(command);

      // Assert
      expect(createMaintenancePlanItemAsyncSpy).toHaveBeenCalledWith(
        command.maintenancePlanItemCreationDto,
      );
    });
  });
});
