import { Test, TestingModule } from '@nestjs/testing';
import { GetAllCountriesQueryHandler } from './get-all-countries.query.handler';
import { CountryService } from '../../../domain/service/country/country.service';
import { GetAllCountriesQuery } from './get-all-countries.query';

const mockCountryService = {
  getAllCountries: jest.fn(),
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
    it('should return all countries when countries are found', async () => {
      // Arrange
      const query = new GetAllCountriesQuery();
      const mockCountries = [{ name: 'Argentina' }, { name: 'Brazil' }];
      mockCountryService.getAllCountries.mockResolvedValue(mockCountries);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual(mockCountries);
      expect(mockCountryService.getAllCountries).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no countries are found', async () => {
      // Arrange
      const query = new GetAllCountriesQuery();
      mockCountryService.getAllCountries.mockResolvedValue([]);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual([]);
      expect(mockCountryService.getAllCountries).toHaveBeenCalledTimes(1);
    });
  });
});