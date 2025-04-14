import { Test, TestingModule } from '@nestjs/testing';
import { CountryRepository } from '@mp/repository';
import { CountryService } from './country.service';

describe('CountryService', () => {
  let service: CountryService;
  let repository: CountryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          provide: CountryRepository,
          useValue: {
            findAllAsync: jest.fn(), 
          },
        },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
    repository = module.get<CountryRepository>(CountryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllCountriesAsync', () => {
    it('should call findAllAsync on the repository', async () => {
      // Arrange
      // Act
      await service.getAllCountriesAsync();

      // Assert
      expect(
        service['countryRepository'].findAllAsync,
      ).toHaveBeenCalledWith();
    });

    it('should return the list of countries from the repository', async () => {
      // Arrange
      const expectedResult = [
        { id: 1, name: 'Argentina' },
        { id: 2, name: 'Brazil' },
      ];
      jest.
        spyOn(
          service['countryRepository'],
          'findAllAsync',
        ).mockResolvedValue(expectedResult);

      // Act
      const result = await service.getAllCountriesAsync();

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});