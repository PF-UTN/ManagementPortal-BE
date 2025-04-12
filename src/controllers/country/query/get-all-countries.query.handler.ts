import { CountryDto } from '@mp/common/dtos';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllCountriesQuery } from './get-all-countries.query';
import { CountryService } from '../../../domain/service/country/country.service';

@QueryHandler(GetAllCountriesQuery)
export class GetAllCountriesQueryHandler
  implements IQueryHandler<GetAllCountriesQuery>
{
  constructor(private readonly countryService: CountryService) {}

  async execute() {
    const foundCountries = await this.countryService.getAllCountriesAsync();

    const countryList: CountryDto[] = foundCountries.map((country) => ({
      id: country.id,
      name: country.name,
    }));

    return countryList;
  }
}
