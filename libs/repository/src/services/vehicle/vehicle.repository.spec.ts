import { Test, TestingModule } from '@nestjs/testing';
import { Vehicle } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

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

    repository = module.get<VehicleRepository>(
      VehicleRepository,
    );

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

  describe('createProductCategoryAsync', () => {
    it('should create a vehicle with the provided data', async () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...vehicleData } = vehicle;
      jest
        .spyOn(prismaService.vehicle, 'create')
        .mockResolvedValueOnce(vehicle);

      // Act
      const result =
        await repository.createVehicleAsync(vehicleData);

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
});
