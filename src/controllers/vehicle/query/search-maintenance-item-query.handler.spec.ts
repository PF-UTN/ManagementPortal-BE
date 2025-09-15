import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchMaintenanceItemResponse } from '@mp/common/dtos';

import { SearchMaintenanceItemQuery } from './search-maintenance-item-query';
import { SearchMaintenanceItemQueryHandler } from './search-maintenance-item-query.handler';
import { MaintenanceItemService } from '../../../domain/service/maintenance-item/maintenance-item.service';

describe('SearchMaintenanceItemQueryHandler', () => {
  let handler: SearchMaintenanceItemQueryHandler;
  let maintenanceItemService: MaintenanceItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchMaintenanceItemQueryHandler,
        {
          provide: MaintenanceItemService,
          useValue: mockDeep(MaintenanceItemService),
        },
      ],
    }).compile();

    handler = module.get<SearchMaintenanceItemQueryHandler>(
      SearchMaintenanceItemQueryHandler,
    );
    maintenanceItemService = module.get<MaintenanceItemService>(
      MaintenanceItemService,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call searchByTextAsync on the service with correct parameters', async () => {
    // Arrange
    const query = new SearchMaintenanceItemQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
    });

    jest
      .spyOn(maintenanceItemService, 'searchByTextAsync')
      .mockResolvedValue({ data: [], total: 0 });

    // Act
    await handler.execute(query);

    // Assert
    expect(maintenanceItemService.searchByTextAsync).toHaveBeenCalledWith(
      query,
    );
  });

  it('should map the response correctly', async () => {
    // Arrange
    const query = new SearchMaintenanceItemQuery({
      searchText: 'test',
      page: 1,
      pageSize: 1,
    });
    const result = [
      {
        id: 1,
        description: 'Test Maintenance Item',
      },
    ];

    const expectedTotal = 20;

    const expectedResponse = new SearchMaintenanceItemResponse({
      total: expectedTotal,
      results: result.map((maintenanceItem) => ({
        id: maintenanceItem.id,
        description: maintenanceItem.description,
      })),
    });

    jest
      .spyOn(maintenanceItemService, 'searchByTextAsync')
      .mockResolvedValue({ data: result, total: expectedTotal });

    // Act
    const response = await handler.execute(query);

    // Assert
    expect(response).toEqual(expectedResponse);
  });
});
