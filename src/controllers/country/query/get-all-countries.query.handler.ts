import { QueryHandler } from '@nestjs/cqrs';
import { GetAllCountriesQuery } from './get-all-countries.query';
import { CountryService } from '../../../domain/service/country/country.service';
import { NotFoundException } from '@nestjs/common';
import { CountryDto } from '@mp/common/dtos';

@QueryHandler(GetAllCountriesQuery)
export class GetAllCountriesQueryHandler {
  constructor(private readonly countryService: CountryService) {}

  async execute(query: GetAllCountriesQuery) {
    const foundCountries = await this.countryService.getAllCountries();

    if (!foundCountries || foundCountries.length === 0) {
      throw new NotFoundException('No countries found in the database.');
    }

    const countryList: CountryDto[] = foundCountries
    .filter(country => country.id !== undefined) 
    .map(country => ({
      id: country.id!, 
      name: country.name,
    }));
  

    return countryList;

  }
}
