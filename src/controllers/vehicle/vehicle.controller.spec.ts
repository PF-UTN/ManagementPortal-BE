import { StreamableFile } from '@nestjs/common';
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
  SearchMaintenancePlanItemRequest,
  UpdateMaintenancePlanItemDto,
  UpdateRepairDto,
  MaintenanceItemCreationDto,
  SearchMaintenanceItemRequest,
  UpdateMaintenanceItemDto,
  DownloadVehicleRequest,
} from '@mp/common/dtos';

import { CreateVehicleMaintenanceItemCommand } from './command/create-vehicle-maintenance-item.command';
import { CreateVehicleMaintenancePlanItemCommand } from './command/create-vehicle-maintenance-plan-item.command';
import { CreateVehicleRepairCommand } from './command/create-vehicle-repair.command';
import { CreateVehicleCommand } from './command/create-vehicle.command';
import { DeleteVehicleMaintenancePlanItemCommand } from './command/delete-vehicle-maintenance-plan-item.command';
import { DeleteVehicleRepairCommand } from './command/delete-vehicle-repair.command';
import { DeleteVehicleCommand } from './command/delete-vehicle.command';
import { UpdateVehicleMaintenanceItemCommand } from './command/update-vehicle-maintenance-item.command';
import { UpdateVehicleMaintenancePlanItemCommand } from './command/update-vehicle-maintenance-plan-item.command';
import { UpdateVehicleRepairCommand } from './command/update-vehicle-repair.command';
import { UpdateVehicleCommand } from './command/update-vehicle.command';
import { DownloadVehiclesQuery } from './query/download-vehicles-query';
import { GetVehicleByIdQuery } from './query/get-vehicle-by-id.query';
import { SearchMaintenanceItemQuery } from './query/search-maintenance-item-query';
import { SearchMaintenancePlanItemQuery } from './query/search-maintenance-plan-item-query';
import { SearchMaintenanceQuery } from './query/search-maintenance-query';
import { SearchRepairQuery } from './query/search-repair-query';
import { SearchVehicleQuery } from './query/search-vehicle-query';
import { VehicleController } from './vehicle.controller';
import {
  DateHelper,
  ExcelExportHelper,
} from '../../../libs/common/src/helpers';

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

  describe('downloadAsync', () => {
    const downloadVehicleRequest: DownloadVehicleRequest = {
      searchText: 'Corolla',
    };

    const buffer = Buffer.from('test');
    const expectedFilename = `${DateHelper.formatYYYYMMDD(
      new Date(),
    )} - Listado Vehiculos`;

    beforeEach(() => {
      jest
        .spyOn(ExcelExportHelper, 'exportToExcelBuffer')
        .mockReturnValue(buffer);
    });

    it('should call queryBus.execute with DownloadVehiclesQuery', async () => {
      await controller.downloadAsync(downloadVehicleRequest);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new DownloadVehiclesQuery(downloadVehicleRequest),
      );
    });

    it('should call ExcelExportHelper.exportToExcelBuffer with vehicles', async () => {
      await controller.downloadAsync(downloadVehicleRequest);

      expect(ExcelExportHelper.exportToExcelBuffer).toHaveBeenCalled();
    });

    it('should return a StreamableFile', async () => {
      const result = await controller.downloadAsync(downloadVehicleRequest);

      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should set the correct filename in the disposition', async () => {
      const result = await controller.downloadAsync(downloadVehicleRequest);

      expect(result.options.disposition).toBe(
        `attachment; filename="${expectedFilename}"`,
      );
    });

    it('should set the correct content type', async () => {
      const result = await controller.downloadAsync(downloadVehicleRequest);

      expect(result.options.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should set the correct length', async () => {
      const result = await controller.downloadAsync(downloadVehicleRequest);

      expect(result.options.length).toBe(buffer.length);
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

  describe('searchVehicleMaintenancePlanItemsAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const vehicleId = 1;
      const request: SearchMaintenancePlanItemRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      };

      await controller.searchVehicleMaintenancePlanItemsAsync(
        vehicleId,
        request,
      );

      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchMaintenancePlanItemQuery(vehicleId, request),
      );
    });
  });

  describe('updateVehicleMaintenancePlanItemAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const maintenancePlanItemId = 1;

      const updateMaintenancePlanItemDtoMock: UpdateMaintenancePlanItemDto = {
        maintenanceItemId: 1,
        kmInterval: 10000,
        timeInterval: 6,
      };

      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new UpdateVehicleMaintenancePlanItemCommand(
        maintenancePlanItemId,
        updateMaintenancePlanItemDtoMock,
      );

      // Act
      await controller.updateVehicleMaintenancePlanItemAsync(
        maintenancePlanItemId,
        updateMaintenancePlanItemDtoMock,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('updateVehicleRepairAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const repairId = 1;

      const updateRepairDtoMock: UpdateRepairDto = {
        date: new Date('1960-01-01'),
        description: 'Puncture',
        kmPerformed: 25000,
        serviceSupplierId: 1,
      };

      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new UpdateVehicleRepairCommand(
        repairId,
        updateRepairDtoMock,
      );

      // Act
      await controller.updateVehicleRepairAsync(repairId, updateRepairDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('deleteVehicleMaintenancePlanItemAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new DeleteVehicleMaintenancePlanItemCommand(1);

      // Act
      await controller.deleteVehicleMaintenancePlanItemAsync(1);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('getVehicleByIdAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const vehicleId = 1;

      await controller.getVehicleByIdAsync(vehicleId);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetVehicleByIdQuery(vehicleId),
      );
    });
  });

  describe('createVehicleMaintenanceItemAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const maintenanceItemCreationDtoMock: MaintenanceItemCreationDto = {
        description: 'Test Maintenance Item',
      };

      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateVehicleMaintenanceItemCommand(
        maintenanceItemCreationDtoMock,
      );

      // Act
      await controller.createVehicleMaintenanceItemAsync(
        maintenanceItemCreationDtoMock,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('searchVehicleMaintenanceItemAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const request: SearchMaintenanceItemRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      };

      await controller.searchVehicleMaintenanceItemAsync(request);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchMaintenanceItemQuery(request),
      );
    });
  });

  describe('updateVehicleAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const updateMaintenanceItemDtoMock: UpdateMaintenanceItemDto = {
        description: 'Test Maintenance Item',
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new UpdateVehicleMaintenanceItemCommand(
        1,
        updateMaintenanceItemDtoMock,
      );

      // Act
      await controller.updateVehicleMaintenanceItemAsync(
        1,
        updateMaintenanceItemDtoMock,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
