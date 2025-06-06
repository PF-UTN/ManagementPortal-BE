import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { townMockData } from '@mp/common/testing';
import { TownRepository } from '@mp/repository';

import { TownService } from './town.service';

describe('TownService', () => {
  let service: TownService;
  let townRepository: TownRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TownService,
        { provide: TownRepository, useValue: mockDeep(TownRepository) },
      ],
    }).compile();

    townRepository = module.get<TownRepository>(TownRepository);

    service = module.get<TownService>(TownService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchTownsByTextAsync', () => {
    it('should call townRepository with the correct searchText and return its result', async () => {
      // Arrange
      const searchText = 'Rosario';
      const searchTownsByTextAsyncSpy = jest
        .spyOn(townRepository, 'searchTownsByTextAsync')
        .mockResolvedValueOnce(townMockData);

      // Act
      const result = await service.searchTownsByTextAsync(searchText);

      // Assert
      expect(searchTownsByTextAsyncSpy).toHaveBeenCalledWith(searchText);
      expect(result).toEqual(townMockData);
    });
  });

  describe('existsAsync', () => {
    it('should call townRepository.existsAsync with the correct id', async () => {
      // Arrange
      const id = 1;

      jest
        .spyOn(townRepository, 'existsAsync')
        .mockResolvedValueOnce(true);

      // Act
      await service.existsAsync(id);

      // Assert
      expect(
        townRepository.existsAsync,
      ).toHaveBeenCalledWith(id);
    });
  });
});