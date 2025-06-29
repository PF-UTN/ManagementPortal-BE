import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { VehicleService } from './vehicle.service';

@Module({
  imports: [RepositoryModule],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleServiceModule {}