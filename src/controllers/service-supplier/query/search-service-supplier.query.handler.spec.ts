import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchServiceSupplierResponse } from '@mp/common/dtos';

import { SearchServiceSupplierQuery } from './search-service-supplier.query';
import { SearchServiceSupplierQueryHandler } from './search-service-supplier.query.handler';
import { ServiceSupplierService } from '../../../domain/service/service-supplier/service-supplier.service';

describe('SearchServiceSupplierQueryHandler', () => {
  let handler: SearchServiceSupplierQueryHandler;
  let serviceSupplierService: ServiceSupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchServiceSupplierQueryHandler,
        {
          provide: ServiceSupplierService,
          useValue: mockDeep(ServiceSupplierService),
        },
      ],
    }).compile();

    handler = module.get<SearchServiceSupplierQueryHandler>(
      SearchServiceSupplierQueryHandler,
    );
    serviceSupplierService = module.get<ServiceSupplierService>(
      ServiceSupplierService,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call searchByTextAsync on the service with correct parameters', async () => {
    // Arrange
    const query = new SearchServiceSupplierQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
    });

    jest
      .spyOn(serviceSupplierService, 'searchByTextAsync')
      .mockResolvedValue({ data: [], total: 0 });

    // Act
    await handler.execute(query);

    // Assert
    expect(serviceSupplierService.searchByTextAsync).toHaveBeenCalledWith(
      query,
    );
  });

  it('should map the response correctly', async () => {
    // Arrange
    const query = new SearchServiceSupplierQuery({
      searchText: 'test',
      page: 1,
      pageSize: 1,
    });
    const result = [
      {
        id: 1,
        businessName: 'Test Service Supplier',
      },
    ];

    const expectedTotal = 20;

    const expectedResponse = new SearchServiceSupplierResponse({
      total: expectedTotal,
      results: result.map((serviceSupplier) => ({
        id: serviceSupplier.id,
        businessName: serviceSupplier.businessName,
      })),
    });

    jest
      .spyOn(serviceSupplierService, 'searchByTextAsync')
      .mockResolvedValue({ data: result, total: expectedTotal });

    // Act
    const response = await handler.execute(query);

    // Assert
    expect(response).toEqual(expectedResponse);
  });
});
