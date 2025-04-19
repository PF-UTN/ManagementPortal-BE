import { RepositoryModule } from '@mp/repository';
import { Module } from '@nestjs/common';

import { TownService } from './town.service';

@Module({
  imports: [RepositoryModule],
  providers: [TownService],
  exports: [TownService],
})
export class TownServiceModule {}