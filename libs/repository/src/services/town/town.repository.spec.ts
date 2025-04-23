import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { townMockData } from '@mp/common/testing';

import { TownRepository } from './town.repository';
import { PrismaService } from '../prisma.service';

describe('TownRepository', () => {
  let repository: TownRepository;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TownRepository,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    prismaService = module.get(PrismaService);
    repository = module.get(TownRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('searchTownsByTextAsync', () => {
    it('should return towns that match the search text', async () => {
      // Arrange
      const searchText = 'Rosario';
      prismaService.town.findMany.mockResolvedValueOnce(townMockData);

      // Act
      const result = await repository.searchTownsByTextAsync(searchText);

      // Assert
      expect(result).toEqual(townMockData);
    });

    it('should return an empty array if no towns match the search text', async () => {
      // Arrange
      const searchText = 'xyz';
      prismaService.town.findMany.mockResolvedValueOnce([]);

      // Act
      const result = await repository.searchTownsByTextAsync(searchText);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return all town when a searchText is not provided', async () => {
      // Arrange
      prismaService.town.findMany.mockResolvedValueOnce(townMockData);
  
      // Act
      const result = await repository.searchTownsByTextAsync('');
  
      // Assert
      expect(result).toEqual(townMockData);
    });
  
  });
});
