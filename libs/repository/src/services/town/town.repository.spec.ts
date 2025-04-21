import { Test, TestingModule } from '@nestjs/testing';

import { PrismaServiceMock, townMockData } from '@mp/common/testing'; 

import { TownRepository } from './town.repository';
import { PrismaService } from '../prisma.service';

describe('TownRepository', () => {
  let repository: TownRepository;
  let prismaServiceMock: PrismaServiceMock;

  beforeEach(async () => {
    prismaServiceMock = new PrismaServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TownRepository, 
        { 
         provide: PrismaService, 
         useValue: prismaServiceMock 
        },
      ],
    }).compile();
  
    repository = module.get<TownRepository>(
        TownRepository
    );
  });
  
  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('searchTownsByTextAsync', () => {
    it('should return towns that match the search text', async () => {
      // Arrange
      const searchText = 'Rosario';
      prismaServiceMock.town.findMany = jest
      .fn()
      .mockResolvedValueOnce([
        townMockData
      ]);

      // Act
      const result = 
        await repository.searchTownsByTextAsync(
            searchText
        );

      // Assert
      expect(
        prismaServiceMock.town.findMany
      ).toHaveBeenCalledWith({ 
        where: {
          OR: [
            { name: { contains: searchText, mode: 'insensitive' } },
            { zipCode: { contains: searchText, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([
        townMockData
      ]);
    });

    it('should return an empty array when no towns match', async () => {
      // Arrange
      const searchText = 'xyz';
      prismaServiceMock.town.findMany.mockResolvedValueOnce([]);

      // Act
      const result = 
      await repository.searchTownsByTextAsync(searchText);

      // Assert
      expect(prismaServiceMock.town.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: searchText, mode: 'insensitive' } },
            { zipCode: { contains: searchText, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([]);
    });

    it('should call Prisma with empty searchText when no parameter is provided', async () => {
      // Arrange
      prismaServiceMock.town.findMany.mockResolvedValueOnce([]);

      // Act
      const result = await repository.searchTownsByTextAsync('');

      // Assert
      expect(prismaServiceMock.town.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([]);
    });
  });
});