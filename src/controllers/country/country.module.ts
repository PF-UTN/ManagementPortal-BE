import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CountryServiceModule } from '../../domain/service/country/country.service.module';

@Module({
    imports: [CountryServiceModule],
    controllers: [CountryController],
    providers: [],
})
export class CountryModule { }