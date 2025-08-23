import { Test, TestingModule } from '@nestjs/testing';
import { MaintenancePlanItem } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { MaintenancePlanItemCreationDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { MaintenancePlanItemRepository } from './maintenance-plan-item.repository';

describe('MaintenancePlanItemRepository', () => {
  let repository: MaintenancePlanItemRepository;
  let prismaService: PrismaService;
  let maintenancePlanItem: ReturnType<typeof mockDeep<MaintenancePlanItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenancePlanItemRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<MaintenancePlanItemRepository>(
      MaintenancePlanItemRepository,
    );

    maintenancePlanItem = mockDeep<MaintenancePlanItem>();

    maintenancePlanItem.id = 1;
    maintenancePlanItem.maintenanceItemId = 1;
    maintenancePlanItem.vehicleId = 1;
    maintenancePlanItem.kmInterval = 10000;
    maintenancePlanItem.timeInterval = 6;
  });

  describe('createMaintenancePlanItemAsync', () => {
    it('should create a maintenance plan item', async () => {
      // Arrange
      const dto: MaintenancePlanItemCreationDto = {
        maintenanceItemId: maintenancePlanItem.maintenanceItemId,
        vehicleId: maintenancePlanItem.vehicleId,
        kmInterval: maintenancePlanItem.kmInterval,
        timeInterval: maintenancePlanItem.timeInterval,
      };
      jest
        .spyOn(prismaService.maintenancePlanItem, 'create')
        .mockResolvedValueOnce(maintenancePlanItem);

      // Act
      const result = await repository.createMaintenancePlanItemAsync(dto);

      // Assert
      expect(result).toEqual(maintenancePlanItem);
    });
  });

  describe('searchByTextAndVehicleIdAsync', () => {
    let searchText: string;
    let page: number;
    let pageSize: number;
    let vehicleId: number;

    beforeEach(() => {
      searchText = 'test';
      page = 1;
      pageSize = 10;
      vehicleId = 1;
    });

    it('should construct the correct query with search text filter and vehicleId', async () => {
      await repository.searchByTextAndVehicleIdAsync(
        searchText,
        page,
        pageSize,
        vehicleId,
      );

      expect(prismaService.maintenancePlanItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            vehicleId: vehicleId,
            maintenanceItem: {
              description: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
          },
        }),
      );
    });

    it('should construct the correct query with skip and take', async () => {
      await repository.searchByTextAndVehicleIdAsync(
        searchText,
        page,
        pageSize,
        vehicleId,
      );

      expect(prismaService.maintenancePlanItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      );
    });

    it('should construct the correct query with count of total items matched', async () => {
      await repository.searchByTextAndVehicleIdAsync(
        searchText,
        page,
        pageSize,
        vehicleId,
      );

      expect(prismaService.maintenancePlanItem.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            vehicleId: vehicleId,
            maintenanceItem: {
              description: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
          },
        }),
      );
    });
  });
});
