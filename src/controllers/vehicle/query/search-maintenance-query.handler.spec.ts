import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchMaintenanceResponse } from '@mp/common/dtos';

import { SearchMaintenanceQuery } from './search-maintenance-query';
import { SearchMaintenanceQueryHandler } from './search-maintenance-query.handler';
import { MaintenanceService } from '../../../domain/service/maintenance/maintenance.service';

describe('SearchMaintenanceQueryHandler', () => {
  let handler: SearchMaintenanceQueryHandler;
  let maintenanceService: MaintenanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchMaintenanceQueryHandler,
        {
          provide: MaintenanceService,
          useValue: mockDeep(MaintenanceService),
        },
      ],
    }).compile();

    handler = module.get<SearchMaintenanceQueryHandler>(
      SearchMaintenanceQueryHandler,
    );
    maintenanceService = module.get<MaintenanceService>(MaintenanceService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call searchByTextAndVehicleIdAsync on the service with correct parameters', async () => {
      // Arrange
      const vehicleId = 1;
      const query = new SearchMaintenanceQuery(vehicleId, {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      });

      jest
        .spyOn(maintenanceService, 'searchByTextAndVehicleIdAsync')
        .mockResolvedValue({ data: [], total: 0 });

      // Act
      await handler.execute(query);

      // Assert
      expect(
        maintenanceService.searchByTextAndVehicleIdAsync,
      ).toHaveBeenCalledWith(query);
    });

    it('should map the response correctly', async () => {
      // Arrange
      const vehicleId = 1;
      const query = new SearchMaintenanceQuery(vehicleId, {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      });
      const result = [
        {
          id: 1,
          date: new Date('2023-01-01'),
          kmPerformed: 5000,
          maintenancePlanItemId: 101,
          serviceSupplierId: 2,
          maintenancePlanItem: {
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
        },
      ];

      const expectedTotal = 20;

      const expectedResponse = new SearchMaintenanceResponse({
        total: expectedTotal,
        results: result.map((maintenance) => ({
          id: maintenance.id,
          date: maintenance.date,
          description:
            maintenance.maintenancePlanItem.maintenanceItem.description,
          kmPerformed: maintenance.kmPerformed,
          serviceSupplierId: maintenance.serviceSupplierId,
        })),
      });

      jest
        .spyOn(maintenanceService, 'searchByTextAndVehicleIdAsync')
        .mockResolvedValue({ data: result, total: expectedTotal });

      // Act
      const response = await handler.execute(query);

      // Assert
      expect(response).toEqual(expectedResponse);
    });
  });
});
