import { RepositoryModule } from '@mp/repository';
import { Module } from '@nestjs/common';

import { ProvinceService } from './province.service';

@Module({
  imports: [RepositoryModule],
  providers: [ProvinceService],
  exports: [ProvinceService],
})
export class ProvinceServiceModule {}