import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MaintenancePlanItem } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  MaintenancePlanItemCreationDto,
  UpdateMaintenancePlanItemDto,
} from '@mp/common/dtos';
import {
  MaintenanceItemRepository,
  MaintenancePlanItemRepository,
  MaintenanceRepository,
  VehicleRepository,
} from '@mp/repository';

import { MaintenancePlanItemService } from './maintenance-plan-item.service';
import { SearchMaintenancePlanItemQuery } from '../../../controllers/vehicle/query/search-maintenance-plan-item-query';

describe('MaintenancePlanItemService', () => {
  let service: MaintenancePlanItemService;
  let repository: MaintenancePlanItemRepository;
  let vehicleRepository: VehicleRepository;
  let maintenanceItemRepository: MaintenanceItemRepository;
  let maintenanceRepository: MaintenanceRepository;
  let maintenancePlanItem: ReturnType<typeof mockDeep<MaintenancePlanItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenancePlanItemService,
        {
          provide: MaintenancePlanItemRepository,
          useValue: mockDeep(MaintenancePlanItemRepository),
        },
        {
          provide: VehicleRepository,
          useValue: mockDeep(VehicleRepository),
        },
        {
          provide: MaintenanceItemRepository,
          useValue: mockDeep(MaintenanceItemRepository),
        },
        {
          provide: MaintenanceRepository,
          useValue: mockDeep(MaintenanceRepository),
        },
      ],
    }).compile();

    repository = module.get<MaintenancePlanItemRepository>(
      MaintenancePlanItemRepository,
    );
    vehicleRepository = module.get<VehicleRepository>(VehicleRepository);
    maintenanceItemRepository = module.get<MaintenanceItemRepository>(
      MaintenanceItemRepository,
    );
    maintenanceRepository = module.get<MaintenanceRepository>(
      MaintenanceRepository,
    );

    service = module.get<MaintenancePlanItemService>(
      MaintenancePlanItemService,
    );

    maintenancePlanItem = mockDeep<MaintenancePlanItem>();

    maintenancePlanItem.id = 1;
    maintenancePlanItem.maintenanceItemId = 1;
    maintenancePlanItem.vehicleId = 1;
    maintenancePlanItem.kmInterval = 10000;
    maintenancePlanItem.timeInterval = 6;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMaintenancePlanItemAsync', () => {
    it('should throw NotFoundException if vehicle does not exist', async () => {
      // Arrange
      const maintenancePlanItemCreationDtoMock: MaintenancePlanItemCreationDto =
        {
          vehicleId: maintenancePlanItem.vehicleId,
          maintenanceItemId: maintenancePlanItem.maintenanceItemId,
          kmInterval: maintenancePlanItem.kmInterval,
          timeInterval: maintenancePlanItem.timeInterval,
        };

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.createMaintenancePlanItemAsync(
          maintenancePlanItemCreationDtoMock,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if maintenance item does not exist', async () => {
      // Arrange
      const maintenancePlanItemCreationDtoMock: MaintenancePlanItemCreationDto =
        {
          vehicleId: maintenancePlanItem.vehicleId,
          maintenanceItemId: maintenancePlanItem.maintenanceItemId,
          kmInterval: maintenancePlanItem.kmInterval,
          timeInterval: maintenancePlanItem.timeInterval,
        };

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValue(true);

      jest
        .spyOn(maintenanceItemRepository, 'existsAsync')
        .mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.createMaintenancePlanItemAsync(
          maintenancePlanItemCreationDtoMock,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call repository.createMaintenancePlanItemAsync with the correct data', async () => {
      // Arrange
      const maintenancePlanItemCreationDtoMock: MaintenancePlanItemCreationDto =
        {
          vehicleId: maintenancePlanItem.vehicleId,
          maintenanceItemId: maintenancePlanItem.maintenanceItemId,
          kmInterval: maintenancePlanItem.kmInterval,
          timeInterval: maintenancePlanItem.timeInterval,
        };

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValue(true);
      jest
        .spyOn(maintenanceItemRepository, 'existsAsync')
        .mockResolvedValue(true);
      jest
        .spyOn(repository, 'createMaintenancePlanItemAsync')
        .mockResolvedValue(maintenancePlanItem);

      // Act
      await service.createMaintenancePlanItemAsync(
        maintenancePlanItemCreationDtoMock,
      );

      // Assert
      expect(repository.createMaintenancePlanItemAsync).toHaveBeenCalledWith(
        maintenancePlanItemCreationDtoMock,
      );
    });
  });

  describe('searchByTextAndVehicleIdAsync', () => {
    it('should throw NotFoundException if vehicle does not exist', async () => {
      // Arrange
      const searchText = 'test';
      const page = 1;
      const pageSize = 10;
      const vehicleId = 1;

      const query = new SearchMaintenancePlanItemQuery(vehicleId, {
        searchText,
        page,
        pageSize,
      });

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.searchByTextAndVehicleIdAsync(query),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call searchByTextAndVehicleIdAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const page = 1;
      const pageSize = 10;
      const vehicleId = 1;

      const query = new SearchMaintenancePlanItemQuery(vehicleId, {
        searchText,
        page,
        pageSize,
      });

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValue(true);

      // Act
      await service.searchByTextAndVehicleIdAsync(query);

      // Assert
      expect(repository.searchByTextAndVehicleIdAsync).toHaveBeenCalledWith(
        query.searchText,
        query.page,
        query.pageSize,
        query.vehicleId,
      );
    });
  });

  describe('updateMaintenancePlanItemAsync', () => {
    it('should throw NotFoundException if maintenance plan item does not exist', async () => {
      // Arrange
      const updateMaintenancePlanItemDtoMock: UpdateMaintenancePlanItemDto = {
        maintenanceItemId: maintenancePlanItem.maintenanceItemId,
        kmInterval: maintenancePlanItem.kmInterval,
        timeInterval: maintenancePlanItem.timeInterval,
      };

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateMaintenancePlanItemAsync(
          maintenancePlanItem.id,
          updateMaintenancePlanItemDtoMock,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if maintenance item does not exist', async () => {
      // Arrange
      const updateMaintenancePlanItemDtoMock: UpdateMaintenancePlanItemDto = {
        maintenanceItemId: maintenancePlanItem.maintenanceItemId,
        kmInterval: maintenancePlanItem.kmInterval,
        timeInterval: maintenancePlanItem.timeInterval,
      };

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(maintenanceItemRepository, 'existsAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateMaintenancePlanItemAsync(
          maintenancePlanItem.id,
          updateMaintenancePlanItemDtoMock,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call repository.updateMaintenancePlanItemAsync with the correct data', async () => {
      // Arrange
      const updateMaintenancePlanItemDtoMock: UpdateMaintenancePlanItemDto = {
        maintenanceItemId: maintenancePlanItem.maintenanceItemId,
        kmInterval: maintenancePlanItem.kmInterval,
        timeInterval: maintenancePlanItem.timeInterval,
      };

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(maintenanceItemRepository, 'existsAsync')
        .mockResolvedValueOnce(true);

      jest
        .spyOn(repository, 'updateMaintenancePlanItemAsync')
        .mockResolvedValueOnce(maintenancePlanItem);

      // Act
      await service.updateMaintenancePlanItemAsync(
        maintenancePlanItem.id,
        updateMaintenancePlanItemDtoMock,
      );

      // Assert
      expect(repository.updateMaintenancePlanItemAsync).toHaveBeenCalledWith(
        maintenancePlanItem.id,
        updateMaintenancePlanItemDtoMock,
      );
    });
  });

  describe('deleteMaintenancePlanItemAsync', () => {
    it('should throw NotFoundException if maintenance plan item does not exist', async () => {
      // Arrange
      const maintenancePlanItemId = maintenancePlanItem.id;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.deleteMaintenancePlanItemAsync(maintenancePlanItemId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if maintenance plan item is in use', async () => {
      // Arrange
      const maintenancePlanItemId = maintenancePlanItem.id;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(maintenanceRepository, 'existsByMaintenancePlanItemIdAsync')
        .mockResolvedValueOnce(true);

      // Act & Assert
      await expect(
        service.deleteMaintenancePlanItemAsync(maintenancePlanItemId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call repository.deleteMaintenancePlanItemAsync with the correct id', async () => {
      // Arrange
      const maintenancePlanItemId = maintenancePlanItem.id;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(maintenanceRepository, 'existsByMaintenancePlanItemIdAsync')
        .mockResolvedValueOnce(false);

      // Act
      await service.deleteMaintenancePlanItemAsync(maintenancePlanItemId);

      // Assert
      expect(repository.deleteMaintenancePlanItemAsync).toHaveBeenCalledWith(
        maintenancePlanItemId,
      );
    });
  });
});
