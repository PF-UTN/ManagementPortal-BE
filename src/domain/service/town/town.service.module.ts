import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { TownService } from './town.service';

@Module({
  imports: [RepositoryModule],
  providers: [TownService],
  exports: [TownService],
})
export class TownServiceModule {}