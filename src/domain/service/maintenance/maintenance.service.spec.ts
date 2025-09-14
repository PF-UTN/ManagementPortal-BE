import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import {
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
      ],
    }).compile();

    repository = module.get<MaintenanceRepository>(MaintenanceRepository);
    vehicleRepository = module.get<VehicleRepository>(VehicleRepository);

    service = module.get<MaintenanceService>(MaintenanceService);
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
});
