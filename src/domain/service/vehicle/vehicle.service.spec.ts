import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Vehicle } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { UpdateVehicleDto, VehicleCreationDto } from '@mp/common/dtos';
import { VehicleRepository } from '@mp/repository';

import { VehicleService } from './vehicle.service';
import { SearchVehicleQuery } from '../../../controllers/vehicle/query/search-vehicle-query';

describe('VehicleService', () => {
  let service: VehicleService;
  let repository: VehicleRepository;
  let vehicle: ReturnType<typeof mockDeep<Vehicle>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: VehicleRepository,
          useValue: mockDeep(VehicleRepository),
        },
      ],
    }).compile();

    repository = module.get<VehicleRepository>(VehicleRepository);

    service = module.get<VehicleService>(VehicleService);

    vehicle = mockDeep<Vehicle>();

    vehicle.id = 1;
    vehicle.licensePlate = 'AB213LM';
    vehicle.brand = 'Toyota';
    vehicle.model = 'Corolla';
    vehicle.kmTraveled = 25000;
    vehicle.admissionDate = mockDeep<Date>();
    vehicle.enabled = true;
    vehicle.deleted = false;
    vehicle.createdAt = mockDeep<Date>();
    vehicle.updatedAt = mockDeep<Date>();
  });

  describe('existsbyLicensePlateAsync', () => {
    it('should call vehicleRepository.existsbyLicensePlateAsync with the correct license plate', async () => {
      // Arrange
      const licensePlate = vehicle.licensePlate;

      jest
        .spyOn(repository, 'existsByLicensePlateAsync')
        .mockResolvedValueOnce(true);

      // Act
      await service.existsByLicensePlateAsync(licensePlate);

      // Assert
      expect(repository.existsByLicensePlateAsync).toHaveBeenCalledWith(
        licensePlate,
      );
    });
  });

  describe('createVehicleAsync', () => {
    it('should throw BadRequestException if vehicle already exists', async () => {
      // Arrange
      const vehicleData: VehicleCreationDto = {
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        kmTraveled: vehicle.kmTraveled,
        admissionDate: new Date('2023-10-01'),
        enabled: vehicle.enabled,
        deleted: vehicle.deleted,
      };

      jest
        .spyOn(repository, 'existsByLicensePlateAsync')
        .mockResolvedValueOnce(true);

      // Act & Assert
      await expect(service.createVehicleAsync(vehicleData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call repository.createVehicleAsync with the correct data', async () => {
      // Arrange
      const vehicleData: VehicleCreationDto = {
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        kmTraveled: vehicle.kmTraveled,
        admissionDate: new Date('2023-10-01'),
        enabled: vehicle.enabled,
        deleted: vehicle.deleted,
      };

      jest
        .spyOn(repository, 'existsByLicensePlateAsync')
        .mockResolvedValueOnce(false);

      jest
        .spyOn(repository, 'createVehicleAsync')
        .mockResolvedValueOnce(vehicle);

      // Act
      await service.createVehicleAsync(vehicleData);

      // Assert
      expect(repository.createVehicleAsync).toHaveBeenCalledWith(vehicleData);
    });
  });

  describe('searchWithFiltersAsync', () => {
    it('should call searchWithFiltersAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const page = 1;
      const pageSize = 10;
      const query = new SearchVehicleQuery({
        searchText,
        page,
        pageSize,
      });

      // Act
      await service.searchByTextAsync(query);

      // Assert
      expect(repository.searchByTextAsync).toHaveBeenCalledWith(
        query.searchText,
        query.page,
        query.pageSize,
      );
    });
  });

  describe('searchWithFiltersAsync', () => {
    it('should call searchWithFiltersAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';

      // Act
      await service.downloadBySearchTextAsync(searchText);

      // Assert
      expect(repository.downloadBySearchTextAsync).toHaveBeenCalledWith(
        searchText,
      );
    });
  });

  describe('deleteVehicleAsync', () => {
    it('should call deleteVehicleAsync on the repository with correct parameters', async () => {
      // Arrange
      const vehicleId = 1;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);
      jest
        .spyOn(repository, 'deleteVehicleAsync')
        .mockResolvedValueOnce(vehicle);

      // Act
      await service.deleteVehicleAsync(vehicleId);

      // Assert
      expect(repository.deleteVehicleAsync).toHaveBeenCalledWith(vehicleId);
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      // Arrange
      const vehicleId = 1;

      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(service.deleteVehicleAsync(vehicleId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateVehicleAsync', () => {
    let vehicleUpdateDtoMock: UpdateVehicleDto;

    beforeEach(() => {
      vehicleUpdateDtoMock = {
        brand: vehicle.brand,
        model: vehicle.model,
        kmTraveled: vehicle.kmTraveled,
        admissionDate: vehicle.admissionDate,
        enabled: vehicle.enabled,
      };
    });

    it('should call vehicleRepository.updateVehicleAsync with correct data', async () => {
      // Arrange
      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);

      const updateVehicleAsyncSpy = jest
        .spyOn(repository, 'updateVehicleAsync')
        .mockResolvedValueOnce(vehicle);

      // Act
      await service.updateVehicleAsync(vehicle.id, vehicleUpdateDtoMock);

      // Assert
      expect(updateVehicleAsyncSpy).toHaveBeenCalledWith(
        vehicle.id,
        vehicleUpdateDtoMock,
      );
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      // Arrange
      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateVehicleAsync(vehicle.id, vehicleUpdateDtoMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIdAsync', () => {
    let vehicleId: number;

    beforeEach(() => {
      vehicleId = 1;
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      // Arrange
      jest.spyOn(repository, 'findByIdAsync').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.findByIdAsync(vehicleId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call findByIdAsync on the repository with correct parameters', async () => {
      // Arrange
      jest.spyOn(repository, 'findByIdAsync').mockResolvedValueOnce(vehicle);

      // Act
      await service.findByIdAsync(vehicleId);

      // Assert
      expect(repository.findByIdAsync).toHaveBeenCalledWith(vehicleId);
    });

    it('should return the vehicle if found', async () => {
      // Arrange
      jest.spyOn(repository, 'findByIdAsync').mockResolvedValueOnce(vehicle);

      // Act
      const result = await service.findByIdAsync(vehicleId);

      // Assert
      expect(result).toEqual(vehicle);
    });
  });
});
