import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repair } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  RepairCreationDataDto,
  RepairCreationDto,
  UpdateRepairDto,
} from '@mp/common/dtos';
import {
  RepairRepository,
  ServiceSupplierRepository,
  VehicleRepository,
} from '@mp/repository';

import { RepairService } from './repair.service';
import { SearchRepairQuery } from '../../../controllers/vehicle/query/search-repair-query';

describe('RepairService', () => {
  let service: RepairService;
  let repository: RepairRepository;
  let vehicleRepository: VehicleRepository;
  let serviceSupplierRepository: ServiceSupplierRepository;
  let repair: ReturnType<typeof mockDeep<Repair>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairService,
        {
          provide: RepairRepository,
          useValue: mockDeep(RepairRepository),
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

    repository = module.get<RepairRepository>(RepairRepository);
    vehicleRepository = module.get<VehicleRepository>(VehicleRepository);
    serviceSupplierRepository = module.get<ServiceSupplierRepository>(
      ServiceSupplierRepository,
    );

    service = module.get<RepairService>(RepairService);

    repair = mockDeep<Repair>();

    repair.id = 1;
    repair.date = mockDeep<Date>();
    repair.description = 'Puncture';
    repair.kmPerformed = 5000;
    repair.deleted = false;
    repair.serviceSupplierId = 1;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteRepairAsync', () => {
    it('should call deleteRepairAsync on the repository with correct parameters', async () => {
      // Arrange
      const repairId = 1;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest.spyOn(repository, 'deleteRepairAsync').mockResolvedValueOnce(repair);

      // Act
      await service.deleteRepairAsync(repairId);

      // Assert
      expect(repository.deleteRepairAsync).toHaveBeenCalledWith(repairId);
    });

    it('should throw NotFoundException if repair does not exist', async () => {
      // Arrange
      const repairId = 1;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(service.deleteRepairAsync(repairId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createRepairAsync', () => {
    it('should throw NotFoundException if vehicle does not exist', async () => {
      // Arrange
      const repairCreationDtoMock: RepairCreationDto = {
        date: repair.date,
        description: repair.description,
        kmPerformed: repair.kmPerformed,
        serviceSupplierId: repair.serviceSupplierId,
      };

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createRepairAsync(repair.vehicleId, repairCreationDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if service supplier does not exist', async () => {
      // Arrange
      const repairCreationDtoMock: RepairCreationDto = {
        date: repair.date,
        description: repair.description,
        kmPerformed: repair.kmPerformed,
        serviceSupplierId: repair.serviceSupplierId,
      };

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'existsAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.createRepairAsync(repair.vehicleId, repairCreationDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call repository.createRepairAsync with the correct data', async () => {
      // Arrange
      const repairCreationDtoMock: RepairCreationDto = {
        date: repair.date,
        description: repair.description,
        kmPerformed: repair.kmPerformed,
        serviceSupplierId: repair.serviceSupplierId,
      };

      const repairCreationDataDtoMock: RepairCreationDataDto = {
        vehicleId: repair.vehicleId,
        ...repairCreationDtoMock,
      };

      jest.spyOn(vehicleRepository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'existsAsync')
        .mockResolvedValueOnce(true);

      jest.spyOn(repository, 'createRepairAsync').mockResolvedValueOnce(repair);

      // Act
      await service.createRepairAsync(repair.vehicleId, repairCreationDtoMock);

      // Assert
      expect(repository.createRepairAsync).toHaveBeenCalledWith(
        repairCreationDataDtoMock,
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

      const query = new SearchRepairQuery(vehicleId, {
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

      const query = new SearchRepairQuery(vehicleId, {
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

      const query = new SearchRepairQuery(vehicleId, {
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

  describe('updateRepairAsync', () => {
    it('should throw NotFoundException if repair does not exist', async () => {
      // Arrange
      const updateRepairDtoMock: UpdateRepairDto = {
        date: repair.date,
        description: repair.description,
        kmPerformed: repair.kmPerformed,
        serviceSupplierId: repair.serviceSupplierId,
      };

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateRepairAsync(repair.id, updateRepairDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if service supplier does not exist', async () => {
      // Arrange
      const updateRepairDtoMock: UpdateRepairDto = {
        date: repair.date,
        description: repair.description,
        kmPerformed: repair.kmPerformed,
        serviceSupplierId: repair.serviceSupplierId,
      };

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'existsAsync')
        .mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateRepairAsync(repair.id, updateRepairDtoMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call repository.updateRepairAsync with the correct data', async () => {
      // Arrange
      const updateRepairDtoMock: UpdateRepairDto = {
        date: repair.date,
        description: repair.description,
        kmPerformed: repair.kmPerformed,
        serviceSupplierId: repair.serviceSupplierId,
      };

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(serviceSupplierRepository, 'existsAsync')
        .mockResolvedValueOnce(true);

      jest.spyOn(repository, 'updateRepairAsync').mockResolvedValueOnce(repair);

      // Act
      await service.updateRepairAsync(repair.id, updateRepairDtoMock);

      // Assert
      expect(repository.updateRepairAsync).toHaveBeenCalledWith(
        repair.id,
        updateRepairDtoMock,
      );
    });
  });
});
