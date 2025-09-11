import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceItem } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { MaintenanceItemCreationDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';
import { MaintenanceItemRepository } from './maintenance-item.repository';

describe('MaintenanceItemRepository', () => {
  let repository: MaintenanceItemRepository;
  let prismaService: PrismaService;
  let maintenanceItem: ReturnType<typeof mockDeep<MaintenanceItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceItemRepository,
        { provide: PrismaService, useValue: mockDeep(PrismaService) },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    repository = module.get<MaintenanceItemRepository>(
      MaintenanceItemRepository,
    );

    maintenanceItem = mockDeep<MaintenanceItem>();

    maintenanceItem.id = 1;
    maintenanceItem.description = 'Test Maintenance Item';
  });

  describe('existsAsync', () => {
    it('should return true if maintenance item exists', async () => {
      // Arrange
      const id = maintenanceItem.id;
      jest
        .spyOn(prismaService.maintenanceItem, 'findUnique')
        .mockResolvedValueOnce(maintenanceItem);

      // Act
      const exists = await repository.existsAsync(id);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if maintenance item does not exist', async () => {
      // Arrange
      const id = maintenanceItem.id;
      jest
        .spyOn(prismaService.maintenanceItem, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const exists = await repository.existsAsync(id);

      // Assert
      expect(exists).toBe(false);
    });

    describe('createMaintenanceItemAsync', () => {
      it('should create a new maintenance item', async () => {
        // Arrange
        const maintenanceItemCreationMock: MaintenanceItemCreationDto = {
          description: maintenanceItem.description,
        };

        jest
          .spyOn(prismaService.maintenanceItem, 'create')
          .mockResolvedValueOnce(maintenanceItem);

        // Act
        const createdMaintenanceItem =
          await repository.createMaintenanceItemAsync(
            maintenanceItemCreationMock,
          );

        // Assert
        expect(createdMaintenanceItem).toEqual(maintenanceItem);
      });
    });
  });
});
