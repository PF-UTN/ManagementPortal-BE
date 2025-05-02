import { Test, TestingModule } from '@nestjs/testing';

import { TownServiceMock, townMockData } from '@mp/common/testing';

import { GetTownByTextQueryHandler } from './get-towns-by-text.query.handler';
import { TownService } from '../../../domain/service/town/town.service';
import { GetTownsByTextQuery } from '../query/get-towns-by-text.query';

describe('GetTownByTextQueryHandler', () => {
  let handler: GetTownByTextQueryHandler;
  let townServiceMock: TownServiceMock;

  beforeEach(async () => {
    townServiceMock = new TownServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTownByTextQueryHandler,
        { provide: TownService, useValue: townServiceMock },
      ],
    }).compile();

    handler = module.get<GetTownByTextQueryHandler>(GetTownByTextQueryHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should call searchTownsByTextAsync with the provided searchText from the query', async () => {
      // Arrange
      const query = new GetTownsByTextQuery('Rosario');
      jest.spyOn(townServiceMock, 'searchTownsByTextAsync').mockResolvedValueOnce(townMockData);

      // Act
      await handler.execute(query);

      // Assert
      expect(townServiceMock.searchTownsByTextAsync).toHaveBeenCalledWith('Rosario');
    });

    it('should map towns as townDtos and return them', async () => {
      // Arrange
      const query = new GetTownsByTextQuery('Rosario');
      jest.spyOn(townServiceMock, 'searchTownsByTextAsync').mockResolvedValueOnce(townMockData);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(townMockData);
    });

    it('should call searchTownsByTextAsync with empty searchText when the query contains an empty string', async () => {
      // Arrange
      const query = new GetTownsByTextQuery('');
      jest.spyOn(townServiceMock, 'searchTownsByTextAsync').mockResolvedValueOnce([]);

      // Act
      await handler.execute(query);

      // Assert
      expect(townServiceMock.searchTownsByTextAsync).toHaveBeenCalledWith('');
    });
    it('should return an empty array when the service returns no towns', async () => {
      // Arrange
      const query = new GetTownsByTextQuery('');
      jest.spyOn(townServiceMock, 'searchTownsByTextAsync').mockResolvedValueOnce([]);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual([]);
    });
  });
});