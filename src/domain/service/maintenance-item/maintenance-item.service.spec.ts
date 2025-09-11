import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceItem } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { MaintenanceItemCreationDto } from '@mp/common/dtos';
import { MaintenanceItemRepository } from '@mp/repository';

import { MaintenanceItemService } from './maintenance-item.service';

describe('MaintenanceItemService', () => {
  let service: MaintenanceItemService;
  let repository: MaintenanceItemRepository;
  let maintenanceItem: ReturnType<typeof mockDeep<MaintenanceItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceItemService,
        {
          provide: MaintenanceItemRepository,
          useValue: mockDeep(MaintenanceItemRepository),
        },
      ],
    }).compile();

    repository = module.get<MaintenanceItemRepository>(
      MaintenanceItemRepository,
    );

    service = module.get<MaintenanceItemService>(MaintenanceItemService);

    maintenanceItem = mockDeep<MaintenanceItem>();

    maintenanceItem.id = 1;
    maintenanceItem.description = 'Test Maintenance Item';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMaintenanceItemAsync', () => {
    it('should call repository.createMaintenanceItemAsync with the correct data', async () => {
      // Arrange
      const maintenanceItemCreationDtoMock: MaintenanceItemCreationDto = {
        description: maintenanceItem.description,
      };

      jest
        .spyOn(repository, 'createMaintenanceItemAsync')
        .mockResolvedValueOnce(maintenanceItem);

      // Act
      await service.createMaintenanceItemAsync(maintenanceItemCreationDtoMock);

      // Assert
      expect(repository.createMaintenanceItemAsync).toHaveBeenCalledWith(
        maintenanceItemCreationDtoMock,
      );
    });
  });
});
