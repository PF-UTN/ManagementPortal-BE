import { CountryRepository } from '@mp/repository';
import { Test, TestingModule } from '@nestjs/testing';

import { CountryService } from './country.service';
import { Country } from '@prisma/client';

const mockCountryRepository = {
  findAllAsync: jest.fn(),
};

describe('CountryService', () => {
  let service: CountryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        { provide: CountryRepository, useValue: mockCountryRepository },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllCountries', () => {
    it('should return all countries when they exist', async () => {
      // Arrange
      const mockCountries: Country[] = [
        { id: 1, name: 'Argentina' },
        { id: 2, name: 'Brazil' },
      ];
      mockCountryRepository.findAllAsync.mockResolvedValue(mockCountries);

      // Act
      const result = await service.getAllCountriesAsync();

      // Assert
      expect(result).toEqual(mockCountries);
      expect(mockCountryRepository.findAllAsync).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no countries are found', async () => {
      // Arrange
      mockCountryRepository.findAllAsync.mockResolvedValue([]);

      // Act
      const result = await service.getAllCountriesAsync();

      // Assert
      expect(result).toEqual([]);
      expect(mockCountryRepository.findAllAsync).toHaveBeenCalledTimes(1);
    });

    it('should return null if findAllAsync resolves to null', async () => {
      // Arrange
      mockCountryRepository.findAllAsync.mockResolvedValue(null);

      // Act
      const result = await service.getAllCountriesAsync();

      // Assert
      expect(result).toBeNull();
      expect(mockCountryRepository.findAllAsync).toHaveBeenCalledTimes(1);
    });
  });
});
