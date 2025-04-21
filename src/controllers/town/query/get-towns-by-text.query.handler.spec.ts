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
    it('should return town data when towns are found', async () => {
      // Arrange
      const query = new GetTownsByTextQuery('Rosario');
      jest.spyOn(townServiceMock, 'searchTownsByTextAsync').mockResolvedValueOnce(townMockData);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(townServiceMock.searchTownsByTextAsync).toHaveBeenCalledWith('Rosario');
      expect(result).toEqual(townMockData);
    });

    it('should return an empty array when no towns are found', async () => {
      // Arrange
      const query = new GetTownsByTextQuery('xyz'); 
      jest.spyOn(townServiceMock, 'searchTownsByTextAsync').mockResolvedValueOnce([]);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(townServiceMock.searchTownsByTextAsync).toHaveBeenCalledWith('xyz');
      expect(result).toEqual([]);
    });

    it('should call searchTownsByTextAsync with empty searchText when no search parameter is provided', async () => {
      // Arrange
      const query = new GetTownsByTextQuery('');
      jest.spyOn(townServiceMock, 'searchTownsByTextAsync').mockResolvedValueOnce([]);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(townServiceMock.searchTownsByTextAsync).toHaveBeenCalledWith('');
      expect(result).toEqual([]);
    });
  });
});