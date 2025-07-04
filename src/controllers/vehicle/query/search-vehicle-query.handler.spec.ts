import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchVehicleResponse } from '@mp/common/dtos';

import {
  SearchVehicleQuery,
} from './search-vehicle-query';
import { SearchVehicleQueryHandler } from './search-vehicle-query.handler';
import { VehicleService } from '../../../domain/service/vehicle/vehicle.service';

describe('SearchVehicleQueryHandler', () => {
  let handler: SearchVehicleQueryHandler;
  let vehicleService: VehicleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchVehicleQueryHandler,
        {
          provide: VehicleService,
          useValue: mockDeep(VehicleService),
        },
      ],
    }).compile();

    handler = module.get<SearchVehicleQueryHandler>(SearchVehicleQueryHandler);
    vehicleService = module.get<VehicleService>(VehicleService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call searchByTextAsync on the service with correct parameters', async () => {
    // Arrange
    const query = new SearchVehicleQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
    });

    jest
      .spyOn(vehicleService, 'searchByTextAsync')
      .mockResolvedValue({ data: [], total: 0 });

    // Act
    await handler.execute(query);

    // Assert
    expect(vehicleService.searchByTextAsync).toHaveBeenCalledWith(query);
  });

  it('should map the response correctly', async () => {
    // Arrange
    const query = new SearchVehicleQuery({
      searchText: 'test',
      page: 1,
      pageSize: 1,
    });
    const result = [
      {
        id: 1,
        licensePlate: 'AB213LM',
        brand: 'Toyota',
        model: 'Corolla',
        kmTraveled: 25000,
        admissionDate: new Date('2023-10-01'),
        enabled: true,
        deleted: false,
        createdAt: new Date('2023-09-01'),
        updatedAt: new Date('2023-10-01'),
      },
    ];

    const expectedTotal = 20;

    const expectedResponse = new SearchVehicleResponse({
      total: expectedTotal,
      results: result.map((vehicle) => ({
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        kmTraveled: vehicle.kmTraveled,
        admissionDate: vehicle.admissionDate,
        enabled: vehicle.enabled,
      })),
    });

    jest
      .spyOn(vehicleService, 'searchByTextAsync')
      .mockResolvedValue({ data: result, total: expectedTotal });

    // Act
    const response = await handler.execute(query);

    // Assert
    expect(response).toEqual(expectedResponse);
  });
});
