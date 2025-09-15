import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Maintenance, MaintenancePlanItem, Vehicle } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { MaintenanceCreationDto, UpdateMaintenanceDto } from '@mp/common/dtos';
import {
  MaintenancePlanItemRepository,
  MaintenanceRepository,
  ServiceSupplierRepository,
  VehicleRepository,
} from '@mp/repository';

import { MaintenanceService } from './maintenance.service';
import { SearchMaintenanceQuery } from '../../../controllers/vehicle/query/search-maintenance-query';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let repository: MaintenanceRepository;
  let vehicleRepository: VehicleRepository;
  let serviceSupplierRepository: ServiceSupplierRepository;
  let maintenancePlanItemRepository: MaintenancePlanItemRepository;
  let maintenance: ReturnType<typeof mockDeep<Maintenance>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        {
          provide: MaintenanceRepository,
          useValue: mockDeep(MaintenanceRepository),
        },
        {
          provide: VehicleRepository,
          useValue: mockDeep(VehicleRepository),
        },
        {
          provide: ServiceSupplierRepository,
          useValue: mockDeep(ServiceSupplierRepository),
        },
        {
          provide: MaintenancePlanItemRepository,
          useValue: mockDeep(MaintenancePlanItemRepository),
        },
        {
          provide: MaintenancePlanItemRepository,
          useValue: mockDeep(MaintenancePlanItemRepository),
        },
      ],
    }).compile();

    repository = module.get<MaintenanceRepository>(MaintenanceRepository);
    vehicleRepository = module.get<VehicleRepository>(VehicleRepository);
    serviceSupplierRepository = module.get<ServiceSupplierRepository>(
      ServiceSupplierRepository,
    );
    maintenancePlanItemRepository = module.get<MaintenancePlanItemRepository>(
      MaintenancePlanItemRepository,
    );

    service = module.get<MaintenanceService>(MaintenanceService);

    maintenance = mockDeep<Maintenance>();

    maintenance.id = 1;
    maintenance.date = mockDeep<Date>();
    maintenance.kmPerformed = 10000;
    maintenance.maintenancePlanItemId = 1;
    maintenance.serviceSupplierId = 1;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByVehicleIdAsync', () => {
    it('should call findByVehicleIdAsync on the repository with correct parameters', async () => {
      // Arrange
      const vehicleId = 1;

      // Act
      await service.findByVehicleIdAsync(vehicleId);

      // Assert
      expect(repository.findByVehicleIdAsync).toHaveBeenCalledWith(vehicleId);
    });
  });

  describe('searchByTextAndVehicleIdAsync', () => {
    it('should throw NotFoundException if vehicle does not exist', async () => {
      // Arrange
      const searchText = 'test';
      const page = 1;
      const pageSize = 10;
      const vehicleId = 1;

      const query = new SearchMaintenanceQuery(vehicleId, {
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

      const query = new SearchMaintenanceQuery(vehicleId, {
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

  describe('createMaintenanceAsync', () => {
    it('should throw NotFoundException if vehicle does not exist', async () => {
      // Arrange
      const vehicleId = 1;
      const maintenanceCreationMock: MaintenanceCreationDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        maintenancePlanItemId: maintenance.maintenancePlanItemId,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(vehicleRepository, 'findByIdAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.createMaintenanceAsync(vehicleId, maintenanceCreationMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when maintenance mileage is less than vehicle mileage', async () => {
      // Arrange
      const vehicleId = 1;
      const maintenanceCreationMock: MaintenanceCreationDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        maintenancePlanItemId: maintenance.maintenancePlanItemId,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      const vehicleMock = mockDeep<Vehicle>();

      vehicleMock.id = vehicleId;
      vehicleMock.kmTraveled = 25000;

      jest
        .spyOn(vehicleRepository, 'findByIdAsync')
        .mockResolvedValueOnce(vehicleMock);

      // Act & Assert
      await expect(
        service.createMaintenanceAsync(vehicleId, maintenanceCreationMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if maintenance plan item does not exists or does not belong to the vehicle with the provided id', async () => {
      // Arrange
      const vehicleId = 1;
      const maintenanceCreationMock: MaintenanceCreationDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        maintenancePlanItemId: maintenance.maintenancePlanItemId,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(vehicleRepository, 'findByIdAsync')
        .mockResolvedValueOnce(mockDeep<Vehicle>());
      jest
        .spyOn(maintenancePlanItemRepository, 'existsByIdAndVehicleIdAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createMaintenanceAsync(vehicleId, maintenanceCreationMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if service supplier does not exists', async () => {
      // Arrange
      const vehicleId = 1;
      const maintenanceCreationMock: MaintenanceCreationDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        maintenancePlanItemId: maintenance.maintenancePlanItemId,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(vehicleRepository, 'findByIdAsync')
        .mockResolvedValueOnce(mockDeep<Vehicle>());
      jest
        .spyOn(maintenancePlanItemRepository, 'existsByIdAndVehicleIdAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'existsAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createMaintenanceAsync(vehicleId, maintenanceCreationMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call repository.createMaintenanceAsync with the correct data', async () => {
      // Arrange
      const vehicleId = 1;
      const maintenanceCreationMock: MaintenanceCreationDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        maintenancePlanItemId: maintenance.maintenancePlanItemId,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(vehicleRepository, 'findByIdAsync')
        .mockResolvedValueOnce(mockDeep<Vehicle>());
      jest
        .spyOn(maintenancePlanItemRepository, 'existsByIdAndVehicleIdAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(repository, 'createMaintenanceAsync')
        .mockResolvedValueOnce(maintenance);

      // Act
      await service.createMaintenanceAsync(vehicleId, maintenanceCreationMock);

      // Assert
      expect(repository.createMaintenanceAsync).toHaveBeenCalledWith(
        maintenanceCreationMock,
      );
    });
  });

  describe('updateMaintenanceAsync', () => {
    it('should throw NotFoundException if maintenance does not exist', async () => {
      // Arrange
      const maintenanceId = 1;
      const updateMaintenanceDtoMock: UpdateMaintenanceDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest.spyOn(repository, 'findByIdAsync').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.updateMaintenanceAsync(maintenanceId, updateMaintenanceDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if maintenance plan item does not exist', async () => {
      // Arrange
      const maintenanceId = 1;
      const updateMaintenanceDtoMock: UpdateMaintenanceDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(maintenance);
      jest
        .spyOn(maintenancePlanItemRepository, 'findByIdAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.updateMaintenanceAsync(maintenanceId, updateMaintenanceDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      // Arrange
      const maintenanceId = 1;
      const updateMaintenanceDtoMock: UpdateMaintenanceDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(maintenance);
      jest
        .spyOn(maintenancePlanItemRepository, 'findByIdAsync')
        .mockResolvedValueOnce(mockDeep<MaintenancePlanItem>());
      jest
        .spyOn(vehicleRepository, 'findByIdAsync')
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.updateMaintenanceAsync(maintenanceId, updateMaintenanceDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when maintenance mileage is less than vehicle mileage', async () => {
      // Arrange
      const maintenanceId = 1;
      const updateMaintenanceDtoMock: UpdateMaintenanceDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(maintenance);
      jest
        .spyOn(maintenancePlanItemRepository, 'findByIdAsync')
        .mockResolvedValueOnce(mockDeep<MaintenancePlanItem>());

      const vehicleMock = mockDeep<Vehicle>();

      vehicleMock.id = 1;
      vehicleMock.kmTraveled = 25000;

      jest
        .spyOn(vehicleRepository, 'findByIdAsync')
        .mockResolvedValueOnce(vehicleMock);

      // Act & Assert
      await expect(
        service.updateMaintenanceAsync(maintenanceId, updateMaintenanceDtoMock),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if service supplier does not exist', async () => {
      // Arrange
      const maintenanceId = 1;
      const updateMaintenanceDtoMock: UpdateMaintenanceDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(maintenance);
      jest
        .spyOn(maintenancePlanItemRepository, 'findByIdAsync')
        .mockResolvedValueOnce(mockDeep<MaintenancePlanItem>());
      jest
        .spyOn(vehicleRepository, 'findByIdAsync')
        .mockResolvedValueOnce(mockDeep<Vehicle>());
      jest
        .spyOn(serviceSupplierRepository, 'existsAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateMaintenanceAsync(maintenanceId, updateMaintenanceDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call repository.updateMaintenanceAsync with the correct data', async () => {
      // Arrange
      const maintenanceId = 1;
      const updateMaintenanceDtoMock: UpdateMaintenanceDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(repository, 'findByIdAsync')
        .mockResolvedValueOnce(maintenance);
      jest
        .spyOn(maintenancePlanItemRepository, 'findByIdAsync')
        .mockResolvedValueOnce(mockDeep<MaintenancePlanItem>());
      jest
        .spyOn(vehicleRepository, 'findByIdAsync')
        .mockResolvedValueOnce(mockDeep<Vehicle>());
      jest
        .spyOn(serviceSupplierRepository, 'existsAsync')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(repository, 'updateMaintenanceAsync')
        .mockResolvedValueOnce(maintenance);

      // Act
      await service.updateMaintenanceAsync(
        maintenanceId,
        updateMaintenanceDtoMock,
      );

      // Assert
      expect(repository.updateMaintenanceAsync).toHaveBeenCalledWith(
        maintenanceId,
        updateMaintenanceDtoMock,
      );
    });
  });

  describe('deleteMaintenanceAsync', () => {
    it('should throw NotFoundException if maintenance does not exist', async () => {
      // Arrange
      const maintenanceId = maintenance.id;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.deleteMaintenanceAsync(maintenanceId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call repository.deleteMaintenanceAsync with the correct id', async () => {
      // Arrange
      const maintenanceId = maintenance.id;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);

      // Act
      await service.deleteMaintenanceAsync(maintenanceId);

      // Assert
      expect(repository.deleteMaintenanceAsync).toHaveBeenCalledWith(
        maintenanceId,
      );
    });
  });
});
