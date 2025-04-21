import { Test, TestingModule } from '@nestjs/testing';

import { TownRepositoryMock, townMockData } from '@mp/common/testing';
import { TownRepository } from '@mp/repository';

import { TownService } from './town.service';

describe('TownService', () => {
  let service: TownService;
  let townRepositoryMock: TownRepositoryMock;

  beforeEach(async () => {
    townRepositoryMock = new TownRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TownService,
        { provide: TownRepository, useValue: townRepositoryMock },
      ],
    }).compile();

    service = module.get<TownService>(TownService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchTownsByTextAsync', () => {
    it('should return towns that match the search text', async () => {
      // Arrange
      const searchText = 'Rosario';
      townRepositoryMock.searchTownsByTextAsync.mockResolvedValueOnce(townMockData);

      // Act
      const result = await service.searchTownsByTextAsync(searchText);

      // Assert
      expect(townRepositoryMock.searchTownsByTextAsync).toHaveBeenCalledWith(searchText);
      expect(result).toEqual(townMockData);
    });

    it('should return an empty array if no towns match', async () => {
      // Arrange
      const searchText = 'xyz'; 
      townRepositoryMock.searchTownsByTextAsync.mockResolvedValueOnce([]);

      // Act
      const result = await service.searchTownsByTextAsync(searchText);

      // Assert
      expect(townRepositoryMock.searchTownsByTextAsync).toHaveBeenCalledWith(searchText);
      expect(result).toEqual([]);
    });

    it('should call townRepository with empty searchText when no parameter is provided', async () => {
      // Arrange
      townRepositoryMock.searchTownsByTextAsync.mockResolvedValueOnce(townMockData);

      // Act
      const result = await service.searchTownsByTextAsync('');

      // Assert
      expect(townRepositoryMock.searchTownsByTextAsync).toHaveBeenCalledWith('');
      expect(result).toEqual(townMockData);
    });
  });
});