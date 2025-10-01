import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, VehicleUsage } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { VehicleUsageCreationDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { VehicleUsageRepository } from './vehicle-usage.repository';

describe('VehicleUsageRepository', () => {
  let repository: VehicleUsageRepository;
  let prismaService: PrismaService;
  let vehicleUsage: ReturnType<typeof mockDeep<VehicleUsage>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleUsageRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<VehicleUsageRepository>(VehicleUsageRepository);

    vehicleUsage = mockDeep<VehicleUsage>();

    vehicleUsage.id = 1;
    vehicleUsage.date = mockDeep<Date>(new Date('2025-01-15'));
    vehicleUsage.vehicleId = 1;
    vehicleUsage.odometer = mockDeep<Prisma.Decimal>(
      new Prisma.Decimal(125000.5),
    );
    vehicleUsage.kmUsed = mockDeep<Prisma.Decimal>(new Prisma.Decimal(252.23));
  });

  describe('createVehicleUsageAsync', () => {
    it('should create a vehicleUsage with the provided data', async () => {
      // Arrange
      const vehicleUsageCreationDataDtoMock: VehicleUsageCreationDataDto = {
        date: vehicleUsage.date,
        vehicleId: vehicleUsage.vehicleId,
        odometer: Number(vehicleUsage.odometer),
        kmUsed: Number(vehicleUsage.kmUsed),
      };
      jest
        .spyOn(prismaService.vehicleUsage, 'create')
        .mockResolvedValueOnce(vehicleUsage);

      // Act
      const result = await repository.createVehicleUsageAsync(
        vehicleUsageCreationDataDtoMock,
      );

      // Assert
      expect(result).toEqual(vehicleUsage);
    });

    it('should call prisma.vehicleUsage.create with correct data', async () => {
      // Arrange
      const vehicleUsageCreationDataDtoMock: VehicleUsageCreationDataDto = {
        date: vehicleUsage.date,
        vehicleId: vehicleUsage.vehicleId,
        odometer: Number(vehicleUsage.odometer),
        kmUsed: Number(vehicleUsage.kmUsed),
      };
      const { vehicleId, ...vehicleUsageData } =
        vehicleUsageCreationDataDtoMock;

      jest
        .spyOn(prismaService.vehicleUsage, 'create')
        .mockResolvedValueOnce(vehicleUsage);

      // Act
      await repository.createVehicleUsageAsync(vehicleUsageCreationDataDtoMock);

      // Assert
      expect(prismaService.vehicleUsage.create).toHaveBeenCalledWith({
        data: {
          ...vehicleUsageData,
          vehicle: {
            connect: { id: vehicleId },
          },
        },
      });
    });
  });

  describe('findLastByVehicleIdAsync', () => {
    it('should return a vehicleUsage if exists', async () => {
      // Arrange
      const vehicleId = vehicleUsage.vehicleId;
      jest
        .spyOn(prismaService.vehicleUsage, 'findFirst')
        .mockResolvedValueOnce(vehicleUsage);

      // Act
      const foundVehicleUsage =
        await repository.findLastByVehicleIdAsync(vehicleId);

      // Assert
      expect(foundVehicleUsage).toBe(vehicleUsage);
    });

    it('should return null if vehicleUsage does not exist', async () => {
      // Arrange
      const vehicleId = vehicleUsage.vehicleId;
      jest
        .spyOn(prismaService.vehicleUsage, 'findFirst')
        .mockResolvedValueOnce(null);

      // Act
      const foundVehicleUsage =
        await repository.findLastByVehicleIdAsync(vehicleId);

      // Assert
      expect(foundVehicleUsage).toBe(null);
    });
  });
});
