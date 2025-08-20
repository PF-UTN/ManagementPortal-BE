import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import {
  MaintenancePlanItemCreationDto,
  RepairCreationDto,
  SearchRepairRequest,
  SearchMaintenanceRequest,
  SearchVehicleRequest,
  UpdateVehicleDto,
} from '@mp/common/dtos';

import { CreateVehicleMaintenancePlanItemCommand } from './command/create-vehicle-maintenance-plan-item.command';
import { CreateVehicleRepairCommand } from './command/create-vehicle-repair.command';
import { CreateVehicleCommand } from './command/create-vehicle.command';
import { DeleteVehicleRepairCommand } from './command/delete-vehicle-repair.command';
import { DeleteVehicleCommand } from './command/delete-vehicle.command';
import { UpdateVehicleCommand } from './command/update-vehicle.command';
import { SearchRepairQuery } from './query/search-repair-query';
import { SearchMaintenanceQuery } from './query/search-maintenance-query';
import { SearchVehicleQuery } from './query/search-vehicle-query';
import { VehicleController } from './vehicle.controller';

describe('VehicleController', () => {
  let controller: VehicleController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep<QueryBus>(),
        },
        {
          provide: CommandBus,
          useValue: mockDeep<CommandBus>(),
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVehicleAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const vehicleCreationDtoMock = {
        licensePlate: 'AB213LM',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 25000,
        admissionDate: new Date('2023-10-01'),
        enabled: true,
        deleted: false,
      };
      const expectedCommand = new CreateVehicleCommand(vehicleCreationDtoMock);

      // Act
      await controller.createVehicleAsync(vehicleCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('searchAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const request: SearchVehicleRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      };

      await controller.searchAsync(request);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchVehicleQuery(request),
      );
    });
  });

  describe('deleteVehicleAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new DeleteVehicleCommand(1);

      // Act
      await controller.deleteVehicleAsync(1);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('updateVehicleAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const vehicleUpdateDtoMock: UpdateVehicleDto = {
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 25000,
        admissionDate: new Date('2023-10-01'),
        enabled: true,
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new UpdateVehicleCommand(1, vehicleUpdateDtoMock);

      // Act
      await controller.updateVehicleAsync(1, vehicleUpdateDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('deleteVehicleRepairAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new DeleteVehicleRepairCommand(1);

      // Act
      await controller.deleteVehicleRepairAsync(1);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('createVehicleRepairAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const vehicleId = 1;

      const repairCreationDtoMock: RepairCreationDto = {
        date: new Date('1960-01-01'),
        description: 'Puncture',
        kmPerformed: 25000,
        serviceSupplierId: 1,
      };

      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateVehicleRepairCommand(
        vehicleId,
        repairCreationDtoMock,
      );

      // Act
      await controller.createVehicleRepairAsync(
        vehicleId,
        repairCreationDtoMock,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('createVehicleMaintenancePlanAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const maintenancePlanItemCreationDtoMock: MaintenancePlanItemCreationDto =
        {
          maintenanceItemId: 1,
          vehicleId: 1,
          kmInterval: 10000,
          timeInterval: 6,
        };

      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateVehicleMaintenancePlanItemCommand(
        maintenancePlanItemCreationDtoMock,
      );

      // Act
      await controller.createVehicleMaintenancePlanItemAsync(
        maintenancePlanItemCreationDtoMock,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('searchVehicleRepairsAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const vehicleId = 1;
      const request: SearchRepairRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      };

      await controller.searchVehicleRepairsAsync(vehicleId, request);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchRepairQuery(vehicleId, request),
      );
    });
  });

  describe('searchVehicleMaintenanceAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const vehicleId = 1;
      const request: SearchMaintenanceRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      };

      await controller.searchVehicleMaintenanceAsync(vehicleId, request);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchMaintenanceQuery(vehicleId, request),
      );
    });
  });
});
