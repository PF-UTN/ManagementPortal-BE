import { Test, TestingModule } from '@nestjs/testing';
import { Vehicle } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { UpdateVehicleDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { VehicleRepository } from './vehicle.repository';

describe('VehicleRepository', () => {
  let repository: VehicleRepository;
  let prismaService: PrismaService;
  let vehicle: ReturnType<typeof mockDeep<Vehicle>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<VehicleRepository>(VehicleRepository);

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

  describe('existsAsync', () => {
    it('should return true if vehicle exists', async () => {
      // Arrange
      const licensePlate = vehicle.licensePlate;
      jest
        .spyOn(prismaService.vehicle, 'findUnique')
        .mockResolvedValueOnce(vehicle);

      // Act
      const exists = await repository.existsByLicensePlateAsync(licensePlate);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if vehicle does not exist', async () => {
      // Arrange
      const licensePlate = vehicle.licensePlate;
      jest
        .spyOn(prismaService.vehicle, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const exists = await repository.existsByLicensePlateAsync(licensePlate);

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('createVehicleCategoryAsync', () => {
    it('should create a vehicle with the provided data', async () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...vehicleData } = vehicle;
      jest
        .spyOn(prismaService.vehicle, 'create')
        .mockResolvedValueOnce(vehicle);

      // Act
      const result = await repository.createVehicleAsync(vehicleData);

      // Assert
      expect(result).toEqual(vehicle);
    });

    it('should call prismaService.vehicle.create with correct data', async () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...vehicleData } = vehicle;
      jest
        .spyOn(prismaService.vehicle, 'create')
        .mockResolvedValueOnce(vehicle);

      // Act
      await repository.createVehicleAsync(vehicleData);

      // Assert
      expect(prismaService.vehicle.create).toHaveBeenCalledWith({
        data: vehicleData,
      });
    });
  });

  describe('searchByTextAsync', () => {
    it('should construct the correct query with search text filter', async () => {
      // Arrange
      const searchText = 'test';
      const page = 1;
      const pageSize = 10;

      // Act
      await repository.searchByTextAsync(searchText, page, pageSize);

      // Assert
      expect(prismaService.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { deleted: false },
              {
                OR: [
                  {
                    licensePlate: { contains: searchText, mode: 'insensitive' },
                  },
                  { brand: { contains: searchText, mode: 'insensitive' } },
                  { model: { contains: searchText, mode: 'insensitive' } },
                ],
              },
            ],
          },
        }),
      );
    });

    it('should construct the correct query with skip and take', async () => {
      // Arrange
      const searchText = 'test';
      const page = 2;
      const pageSize = 10;

      // Act
      await repository.searchByTextAsync(searchText, page, pageSize);

      // Assert
      expect(prismaService.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      );
    });

    it('should construct the correct query with count of total items matched', async () => {
      // Arrange
      const searchText = 'test';
      const page = 2;
      const pageSize = 10;

      // Act
      await repository.searchByTextAsync(searchText, page, pageSize);

      // Assert
      expect(prismaService.vehicle.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { deleted: false },
              {
                OR: [
                  {
                    licensePlate: { contains: searchText, mode: 'insensitive' },
                  },
                  { brand: { contains: searchText, mode: 'insensitive' } },
                  { model: { contains: searchText, mode: 'insensitive' } },
                ],
              },
            ],
          },
        }),
      );
    });
  });

  describe('downloadBySearchTextAsync', () => {
    it('should construct the correct query with search text filter', async () => {
      // Arrange
      const searchText = 'test';

      // Act
      await repository.downloadBySearchTextAsync(searchText);

      // Assert
      expect(prismaService.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { deleted: false },
              {
                OR: [
                  {
                    licensePlate: { contains: searchText, mode: 'insensitive' },
                  },
                  { brand: { contains: searchText, mode: 'insensitive' } },
                  { model: { contains: searchText, mode: 'insensitive' } },
                ],
              },
            ],
          },
        }),
      );
    });
  });

  describe('existsAsync', () => {
    it('should return true if vehicle exists', async () => {
      // Arrange
      const vehicleId = 1;
      jest
        .spyOn(prismaService.vehicle, 'findFirst')
        .mockResolvedValueOnce(vehicle);

      // Act
      const exists = await repository.existsAsync(vehicleId);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if vehicle does not exist', async () => {
      // Arrange
      const vehicleId = 1;
      jest
        .spyOn(prismaService.vehicle, 'findFirst')
        .mockResolvedValueOnce(null);

      // Act
      const exists = await repository.existsAsync(vehicleId);

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('deleteVehicleAsync', () => {
    it('should update an existing vehicle deleted field', async () => {
      // Arrange
      jest
        .spyOn(prismaService.vehicle, 'update')
        .mockResolvedValueOnce(vehicle);

      // Act
      const updatedVehicle = await repository.deleteVehicleAsync(vehicle.id);

      // Assert
      expect(updatedVehicle).toEqual(vehicle);
    });
  });

  describe('updateVehicleAsync', () => {
    it('should update an existing vehicle', async () => {
      // Arrange
      const vehicleUpdateInput: UpdateVehicleDto = {
        brand: vehicle.brand,
        model: vehicle.model,
        kmTraveled: vehicle.kmTraveled,
        admissionDate: vehicle.admissionDate,
        enabled: vehicle.enabled,
      };

      jest
        .spyOn(prismaService.vehicle, 'update')
        .mockResolvedValueOnce(vehicle);

      // Act
      const updatedVehicle = await repository.updateVehicleAsync(
        vehicle.id,
        vehicleUpdateInput,
      );

      // Assert
      expect(updatedVehicle).toEqual(vehicle);
    });
  });

  describe('findByIdAsync', () => {
    it('should return a vehicle if it exists', async () => {
      // Arrange
      const vehicleId = 1;
      jest
        .spyOn(prismaService.vehicle, 'findUnique')
        .mockResolvedValueOnce(vehicle);

      // Act
      const foundVehicle = await repository.findByIdAsync(vehicleId);

      // Assert
      expect(foundVehicle).toEqual(vehicle);
    });

    it('should return null if the vehicle does not exist', async () => {
      // Arrange
      const vehicleId = 1;
      jest
        .spyOn(prismaService.vehicle, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const vehicle = await repository.findByIdAsync(vehicleId);

      // Assert
      expect(vehicle).toBeNull();
    });
  });
});
