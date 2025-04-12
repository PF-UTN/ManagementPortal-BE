import { RepositoryModule } from '@mp/repository';
import { Module } from '@nestjs/common';

import { CountryService } from './country.service';

@Module({
  imports: [RepositoryModule],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryServiceModule {}