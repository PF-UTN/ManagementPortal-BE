import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceItem } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { MaintenanceItemCreationDto } from '@mp/common/dtos';

import { CreateVehicleMaintenanceItemCommand } from './create-vehicle-maintenance-item.command';
import { CreateVehicleMaintenanceItemCommandHandler } from './create-vehicle-maintenance-item.command.handler';
import { MaintenanceItemService } from '../../../domain/service/maintenance-item/maintenance-item.service';

describe('CreateMaintenanceItemCommandHandler', () => {
  let handler: CreateVehicleMaintenanceItemCommandHandler;
  let maintenanceItemService: MaintenanceItemService;
  let maintenanceItem: ReturnType<typeof mockDeep<MaintenanceItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVehicleMaintenanceItemCommandHandler,
        {
          provide: MaintenanceItemService,
          useValue: mockDeep(MaintenanceItemService),
        },
      ],
    }).compile();

    maintenanceItemService = module.get<MaintenanceItemService>(
      MaintenanceItemService,
    );

    handler = module.get<CreateVehicleMaintenanceItemCommandHandler>(
      CreateVehicleMaintenanceItemCommandHandler,
    );

    maintenanceItem = mockDeep<MaintenanceItem>();

    maintenanceItem.id = 1;
    maintenanceItem.description = 'Test Maintenance Item';
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call createMaintenanceItemAsync with correct parameters', async () => {
      // Arrange
      const maintenanceItemCreationDtoMock: MaintenanceItemCreationDto = {
        description: maintenanceItem.description,
      };

      const command = new CreateVehicleMaintenanceItemCommand(
        maintenanceItemCreationDtoMock,
      );
      const createMaintenanceItemAsyncSpy = jest
        .spyOn(maintenanceItemService, 'createMaintenanceItemAsync')
        .mockResolvedValueOnce(maintenanceItem);

      // Act
      await handler.execute(command);

      // Assert
      expect(createMaintenanceItemAsyncSpy).toHaveBeenCalledWith(
        command.maintenanceItemCreationDto,
      );
    });
  });
});
