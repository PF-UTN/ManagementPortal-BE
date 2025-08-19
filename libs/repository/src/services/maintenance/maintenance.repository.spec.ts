import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { PrismaService } from '../prisma.service';
import { MaintenanceRepository } from './maintenance.repository';

describe('MaintenanceRepository', () => {
  let repository: MaintenanceRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<MaintenanceRepository>(MaintenanceRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
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

      expect(prismaService.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            maintenancePlanItem: {
              vehicleId: vehicleId,
              maintenanceItem: {
                description: { contains: searchText, mode: 'insensitive' },
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

      expect(prismaService.maintenance.findMany).toHaveBeenCalledWith(
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

      expect(prismaService.maintenance.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            maintenancePlanItem: {
              vehicleId: vehicleId,
              maintenanceItem: {
                description: { contains: searchText, mode: 'insensitive' },
              },
            },
          },
        }),
      );
    });
  });
});
