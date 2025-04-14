import { CountryDto } from '@mp/common/dtos';
import { Test, TestingModule } from '@nestjs/testing';
import { GetAllCountriesQuery } from './get-all-countries.query';
import { GetAllCountriesQueryHandler } from './get-all-countries.query.handler';
import { CountryService } from '../../../domain/service/country/country.service';

const mockCountryService = {
  getAllCountriesAsync: jest.fn(),
};

describe('GetAllCountriesQueryHandler', () => {
  let handler: GetAllCountriesQueryHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllCountriesQueryHandler,
        {
          provide: CountryService,
          useValue: mockCountryService,
        },
      ],
    }).compile();

    handler = module.get<GetAllCountriesQueryHandler>(GetAllCountriesQueryHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should return a list of CountryDto when countries are found', async () => {
      // Arrange
      const query = new GetAllCountriesQuery();
      const mockCountries = [
        { id: 1, name: 'Argentina' },
        { id: 2, name: 'Brazil' },
      ];
      mockCountryService.getAllCountriesAsync.mockResolvedValue(mockCountries);

      const expectedResult: CountryDto[] = mockCountries.map((country) => ({
        id: country.id,
        name: country.name,
      }));

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should return an empty list when no countries are found', async () => {
      // Arrange
      const query = new GetAllCountriesQuery();
      mockCountryService.getAllCountriesAsync.mockResolvedValue([]);

      const expectedResult: CountryDto[] = [];

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});