import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CountryServiceModule } from '../../domain/service/country/country.service.module';
import { GetAllCountriesQueryHandler } from './query/get-all-countries.query.handler';

@Module({
    imports: [CountryServiceModule],
    controllers: [CountryController],
    providers: [GetAllCountriesQueryHandler],
})
export class CountryModule { }