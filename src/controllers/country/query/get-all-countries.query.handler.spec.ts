import { Test, TestingModule } from '@nestjs/testing';
import { GetAllCountriesQueryHandler } from './get-all-countries.query.handler';
import { CountryService } from '../../../domain/service/country/country.service';

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
});