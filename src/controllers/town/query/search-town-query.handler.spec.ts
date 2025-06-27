import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { SearchTownResponse } from '@mp/common/dtos';

import {
  SearchTownQuery,
} from './search-town-query';
import { SearchTownQueryHandler } from './search-town-query.handler';
import { TownService } from '../../../domain/service/town/town.service';

describe('SearchTownQueryHandler', () => {
  let handler: SearchTownQueryHandler;
  let townService: TownService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchTownQueryHandler,
        {
          provide: TownService,
          useValue: mockDeep(TownService),
        },
      ],
    }).compile();

    handler = module.get<SearchTownQueryHandler>(SearchTownQueryHandler);
    townService = module.get<TownService>(TownService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call searchWithFiltersAsync on the service with correct parameters', async () => {
    // Arrange
    const query = new SearchTownQuery({
      searchText: 'test',
      page: 1,
      pageSize: 10,
    });

    jest
      .spyOn(townService, 'searchWithFiltersAsync')
      .mockResolvedValue({ data: [], total: 0 });

    // Act
    await handler.execute(query);

    // Assert
    expect(townService.searchWithFiltersAsync).toHaveBeenCalledWith(query);
  });

  it('should map the response correctly', async () => {
    // Arrange
    const query = new SearchTownQuery({
      searchText: 'test',
      page: 1,
      pageSize: 1,
    });
    const result = [
      {
        id: 1,
        name: 'Test Town',
        zipCode: '12345',
        provinceId: 1,
      },
    ];

    const expectedTotal = 20;

    const expectedResponse = new SearchTownResponse({
      total: expectedTotal,
      results: result.map((town) => ({
        id: town.id,
        name: town.name,
        zipCode: town.zipCode,
        provinceId: town.provinceId,
      })),
    });

    jest
      .spyOn(townService, 'searchWithFiltersAsync')
      .mockResolvedValue({ data: result, total: expectedTotal });

    // Act
    const response = await handler.execute(query);

    // Assert
    expect(response).toEqual(expectedResponse);
  });
});
