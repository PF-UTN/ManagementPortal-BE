import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchRepairResponse } from '@mp/common/dtos';

import { SearchRepairQuery } from './search-repair-query';
import { SearchRepairQueryHandler } from './search-repair-query.handler';
import { RepairService } from '../../../domain/service/repair/repair.service';

describe('SearchRepairQueryHandler', () => {
  let handler: SearchRepairQueryHandler;
  let repairService: RepairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchRepairQueryHandler,
        {
          provide: RepairService,
          useValue: mockDeep(RepairService),
        },
      ],
    }).compile();

    handler = module.get<SearchRepairQueryHandler>(SearchRepairQueryHandler);
    repairService = module.get<RepairService>(RepairService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call searchByTextAndVehicleIdAsync on the service with correct parameters', async () => {
      // Arrange
      const vehicleId = 1;
      const query = new SearchRepairQuery(vehicleId, {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      });

      jest
        .spyOn(repairService, 'searchByTextAndVehicleIdAsync')
        .mockResolvedValue({ data: [], total: 0 });

      // Act
      await handler.execute(query);

      // Assert
      expect(repairService.searchByTextAndVehicleIdAsync).toHaveBeenCalledWith(
        query,
      );
    });

    it('should map the response correctly', async () => {
      // Arrange
      const vehicleId = 1;
      const query = new SearchRepairQuery(vehicleId, {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      });
      const result = [
        {
          id: 1,
          date: new Date('2023-10-01'),
          description: 'Puncture',
          kmPerformed: 5000,
          deleted: false,
          vehicleId: 1,
          serviceSupplierId: 1,
        },
      ];

      const expectedTotal = 20;

      const expectedResponse = new SearchRepairResponse({
        total: expectedTotal,
        results: result.map((repair) => ({
          id: repair.id,
          date: repair.date,
          description: repair.description,
          kmPerformed: repair.kmPerformed,
        })),
      });

      jest
        .spyOn(repairService, 'searchByTextAndVehicleIdAsync')
        .mockResolvedValue({ data: result, total: expectedTotal });

      // Act
      const response = await handler.execute(query);

      // Assert
      expect(response).toEqual(expectedResponse);
    });
  });
});
