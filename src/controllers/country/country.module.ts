import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CountryService } from '../../domain/service/country/country.service';

@Module({
    controllers: [CountryController],
    providers: [CountryService],
})
export class CountryModule {}