import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceItem } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import {
  MaintenanceItemCreationDto,
  UpdateMaintenanceItemDto,
} from '@mp/common/dtos';
import { MaintenanceItemRepository } from '@mp/repository';

import { MaintenanceItemService } from './maintenance-item.service';
import { SearchMaintenanceItemQuery } from '../../../controllers/vehicle/query/search-maintenance-item-query';

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

  describe('searchByTextAsync', () => {
    it('should call searchByTextAsync on the repository with correct parameters', async () => {
      // Arrange
      const searchText = 'test';
      const page = 1;
      const pageSize = 10;
      const query = new SearchMaintenanceItemQuery({
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

  describe('updateMaintenanceItemAsync', () => {
    let maintenanceItemUpdateDtoMock: UpdateMaintenanceItemDto;

    beforeEach(() => {
      maintenanceItemUpdateDtoMock = {
        description: maintenanceItem.description,
      };
    });

    it('should call maintenanceItemRepository.updateMaintenanceItemAsync with correct data', async () => {
      // Arrange
      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(true);

      const updateMaintenanceItemAsyncSpy = jest
        .spyOn(repository, 'updateMaintenanceItemAsync')
        .mockResolvedValueOnce(maintenanceItem);

      // Act
      await service.updateMaintenanceItemAsync(
        maintenanceItem.id,
        maintenanceItemUpdateDtoMock,
      );

      // Assert
      expect(updateMaintenanceItemAsyncSpy).toHaveBeenCalledWith(
        maintenanceItem.id,
        maintenanceItemUpdateDtoMock,
      );
    });

    it('should throw NotFoundException if maintenanceItem does not exist', async () => {
      // Arrange
      jest.spyOn(repository, 'existsAsync').mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.updateMaintenanceItemAsync(
          maintenanceItem.id,
          maintenanceItemUpdateDtoMock,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
