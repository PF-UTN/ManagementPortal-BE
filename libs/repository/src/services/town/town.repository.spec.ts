import { Test, TestingModule } from '@nestjs/testing';
import { Town } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { townMockData } from '@mp/common/testing';

import { TownRepository } from './town.repository';
import { PrismaService } from '../prisma.service';

describe('TownRepository', () => {
  let repository: TownRepository;
  let prismaService: DeepMockProxy<PrismaService>;
  let town: ReturnType<typeof mockDeep<Town>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TownRepository,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    prismaService = module.get(PrismaService);
    repository = module.get(TownRepository);

    town = mockDeep<Town>();

    town.id = 1;
    town.name = 'Rosario';
    town.zipCode = '2000';
    town.provinceId = 1;
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

    it('should call findMany on prismaService.town.', async () => {
      // Arrange
      const searchText = 'Ros';
      prismaService.town.findMany.mockResolvedValueOnce(townMockData);
      // Act
      await repository.searchTownsByTextAsync(searchText);

      // Assert
      expect(prismaService.town.findMany).toHaveBeenLastCalledWith({
        where: {
          OR: [
            { name: { contains: searchText, mode: 'insensitive' } },
            { zipCode: { contains: searchText, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    })

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

  describe('existsAsync', () => {
    it('should return true if town exists', async () => {
      // Arrange
      const townId = 1;
      jest
        .spyOn(prismaService.town, 'findUnique')
        .mockResolvedValueOnce(town);

      // Act
      const exists = await repository.existsAsync(townId);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if town does not exist', async () => {
      // Arrange
      const townId = 1;
      jest
        .spyOn(prismaService.town, 'findUnique')
        .mockResolvedValueOnce(null);

      // Act
      const exists = await repository.existsAsync(townId);

      // Assert
      expect(exists).toBe(false);
    });
  });
});
