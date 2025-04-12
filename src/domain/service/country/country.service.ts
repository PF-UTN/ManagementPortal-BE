import { CountryRepository } from '@mp/repository'; 
import { Injectable } from '@nestjs/common';

@Injectable()
export class CountryService {
  constructor(
    private readonly countryRepository: CountryRepository 
  ) {}

  async getAllCountriesAsync() {
    return await this.countryRepository.findAllAsync();
  }
}
