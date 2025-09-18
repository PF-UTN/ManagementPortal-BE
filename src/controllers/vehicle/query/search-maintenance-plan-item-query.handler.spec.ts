import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchMaintenancePlanItemResponse } from '@mp/common/dtos';

import { SearchMaintenancePlanItemQuery } from './search-maintenance-plan-item-query';
import { SearchMaintenancePlanItemQueryHandler } from './search-maintenance-plan-item-query.handler';
import { MaintenancePlanItemService } from '../../../domain/service/maintenance-plan-item/maintenance-plan-item.service';

describe('SearchMaintenancePlanItemQueryHandler', () => {
  let handler: SearchMaintenancePlanItemQueryHandler;
  let maintenancePlanItemService: MaintenancePlanItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchMaintenancePlanItemQueryHandler,
        {
          provide: MaintenancePlanItemService,
          useValue: mockDeep(MaintenancePlanItemService),
        },
      ],
    }).compile();

    handler = module.get<SearchMaintenancePlanItemQueryHandler>(
      SearchMaintenancePlanItemQueryHandler,
    );
    maintenancePlanItemService = module.get<MaintenancePlanItemService>(
      MaintenancePlanItemService,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call searchByTextAndVehicleIdAsync on the service with correct parameters', async () => {
      // Arrange
      const vehicleId = 1;
      const query = new SearchMaintenancePlanItemQuery(vehicleId, {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      });

      jest
        .spyOn(maintenancePlanItemService, 'searchByTextAndVehicleIdAsync')
        .mockResolvedValue({ data: [], total: 0 });

      // Act
      await handler.execute(query);

      // Assert
      expect(
        maintenancePlanItemService.searchByTextAndVehicleIdAsync,
      ).toHaveBeenCalledWith(query);
    });

    it('should map the response correctly', async () => {
      // Arrange
      const vehicleId = 1;
      const query = new SearchMaintenancePlanItemQuery(vehicleId, {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      });
      const result = [
        {
          id: 101,
          kmInterval: 10000,
          timeInterval: 12,
          vehicleId: vehicleId,
          maintenanceItemId: 1,
          maintenanceItem: {
            id: 1,
            description: 'Filter change',
          },
        },
      ];

      const expectedTotal = 1;

      const expectedResponse = new SearchMaintenancePlanItemResponse({
        total: expectedTotal,
        results: result.map((maintenancePlanItem) => ({
          id: maintenancePlanItem.id,
          description: maintenancePlanItem.maintenanceItem.description,
          kmInterval: maintenancePlanItem.kmInterval,
          timeInterval: maintenancePlanItem.timeInterval,
        })),
      });

      jest
        .spyOn(maintenancePlanItemService, 'searchByTextAndVehicleIdAsync')
        .mockResolvedValue({ data: result, total: expectedTotal });

      // Act
      const response = await handler.execute(query);

      // Assert
      expect(response).toEqual(expectedResponse);
    });
  });
});
