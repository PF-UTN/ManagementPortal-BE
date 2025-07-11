import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { SearchTownRequest } from '@mp/common/dtos';
import { townMockData, QueryBusMock } from '@mp/common/testing';

import { GetTownsByTextQuery } from './query/get-towns-by-text.query';
import { SearchTownQuery } from './query/search-town-query';
import { TownController } from './town.controller';

describe('TownController', () => {
  let controller: TownController;
  let queryBusMock: QueryBusMock;

  beforeEach(async () => {
    queryBusMock = new QueryBusMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TownController],
      providers: [
        { provide: QueryBus, useValue: queryBusMock }, 
      ],
    }).compile();

    controller = module.get<TownController>(TownController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchTownsAsync', () => {
    it('should call queryBus.execute with GetTownsByTextQuery when searchTownsAsync is called', async () => {
      // Arrange
      const searchText = 'Rosario';
      jest.spyOn(queryBusMock, 'execute').mockResolvedValueOnce(townMockData);
      const expectedQuery = new GetTownsByTextQuery(searchText);

      // Act
      const result = await controller.searchTownsAsync(searchText);

      // Assert
      expect(queryBusMock.execute).toHaveBeenCalledWith(expectedQuery);
      expect(result).toEqual(townMockData);
    });

    it('should call queryBus.execute with empty searchText when no search parameter is provided', async () => {
      // Arrange
      jest.spyOn(queryBusMock, 'execute').mockResolvedValueOnce([]);
      const expectedQuery = new GetTownsByTextQuery('');

      // Act
      const result = await controller.searchTownsAsync();

      // Assert
      expect(queryBusMock.execute).toHaveBeenCalledWith(expectedQuery);
      expect(result).toEqual([]);
    });
  });

  describe('searchAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const request: SearchTownRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
      };

      await controller.searchAsync(request);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new SearchTownQuery(request),
      );
    });
  });
});