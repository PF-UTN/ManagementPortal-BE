import { Test, TestingModule } from '@nestjs/testing';
import { Maintenance } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { MaintenanceCreationDto, UpdateMaintenanceDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { MaintenanceRepository } from './maintenance.repository';

describe('MaintenanceRepository', () => {
  let repository: MaintenanceRepository;
  let prismaService: PrismaService;
  let maintenance: ReturnType<typeof mockDeep<Maintenance>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<MaintenanceRepository>(MaintenanceRepository);

    maintenance = mockDeep<Maintenance>();

    maintenance.id = 1;
    maintenance.date = mockDeep<Date>();
    maintenance.kmPerformed = 10000;
    maintenance.maintenancePlanItemId = 1;
    maintenance.serviceSupplierId = 1;
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

  describe('existsByMaintenancePlanItemIdAsync', () => {
    it('should return true if maintenance exists for the given maintenancePlanItemId', async () => {
      // Arrange
      const maintenancePlanItemId = maintenance.maintenancePlanItemId;

      jest.spyOn(prismaService.maintenance, 'count').mockResolvedValueOnce(1);

      const isUsedInMaintenance =
        await repository.existsByMaintenancePlanItemIdAsync(
          maintenancePlanItemId,
        );

      expect(isUsedInMaintenance).toBe(true);
    });

    it('should return false if maintenance does not exist for the given maintenancePlanItemId', async () => {
      // Arrange
      const maintenancePlanItemId = maintenance.maintenancePlanItemId;

      jest.spyOn(prismaService.maintenance, 'count').mockResolvedValueOnce(0);

      const isUsedInMaintenance =
        await repository.existsByMaintenancePlanItemIdAsync(
          maintenancePlanItemId,
        );

      expect(isUsedInMaintenance).toBe(false);
    });
  });

  describe('createMaintenanceAsync', () => {
    it('should create a new maintenance', async () => {
      // Arrange
      const maintenanceCreationMock: MaintenanceCreationDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        maintenancePlanItemId: maintenance.maintenancePlanItemId,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(prismaService.maintenance, 'create')
        .mockResolvedValueOnce(maintenance);

      // Act
      const createdMaintenance = await repository.createMaintenanceAsync(
        maintenanceCreationMock,
      );

      // Assert
      expect(createdMaintenance).toEqual(maintenance);
    });
  });

  describe('updateMaintenanceAsync', () => {
    it('should update an existing maintenance', async () => {
      // Arrange
      const updateMaintenanceDtoMock: UpdateMaintenanceDto = {
        date: maintenance.date,
        kmPerformed: maintenance.kmPerformed,
        serviceSupplierId: maintenance.serviceSupplierId,
      };

      jest
        .spyOn(prismaService.maintenance, 'update')
        .mockResolvedValueOnce(maintenance);

      // Act
      const updatedMaintenance = await repository.updateMaintenanceAsync(
        maintenance.id,
        updateMaintenanceDtoMock,
      );

      // Assert
      expect(updatedMaintenance).toEqual(maintenance);
    });
  });

  describe('existsAsync', () => {
    it('should return true if maintenance exists', async () => {
      // Arrange
      const id = maintenance.id;
      jest
        .spyOn(prismaService.maintenance, 'findUnique')
        .mockResolvedValueOnce(maintenance);

      // Act
      const exists = await repository.existsAsync(id);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if maintenance does not exist', async () => {
      // Arrange
      const id = maintenance.id;
      jest
        .spyOn(prismaService.maintenance, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const exists = await repository.existsAsync(id);

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('findByIdAsync', () => {
    it('should return a maintenance if exists', async () => {
      // Arrange
      const id = maintenance.id;
      jest
        .spyOn(prismaService.maintenance, 'findUnique')
        .mockResolvedValueOnce(maintenance);

      // Act
      const foundMaintenance = await repository.findByIdAsync(id);

      // Assert
      expect(foundMaintenance).toBe(maintenance);
    });

    it('should return null if maintenance does not exist', async () => {
      // Arrange
      const id = maintenance.id;
      jest
        .spyOn(prismaService.maintenance, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const foundMaintenance = await repository.findByIdAsync(id);

      // Assert
      expect(foundMaintenance).toBe(null);
    });
  });

  describe('deleteMaintenanceAsync', () => {
    it('should delete an existing maintenance', async () => {
      // Arrange
      const id = maintenance.id;
      jest
        .spyOn(prismaService.maintenance, 'delete')
        .mockResolvedValueOnce(maintenance);

      // Act
      const deletedMaintenance = await repository.deleteMaintenanceAsync(id);

      // Assert
      expect(deletedMaintenance).toEqual(maintenance);
    });
  });
});
