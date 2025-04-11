import { Injectable } from '@nestjs/common';
import { CountryRepository } from '@mp/repository'; 
import { Country } from '../../entity/country.entity';

@Injectable()
export class CountryService {
  constructor(private readonly countryRepository: CountryRepository ) {}

  async getAllCountries() {
    return await this.countryRepository.findAllAsync();
  }
}
