import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { MaintenanceService } from './maintenance.service';

@Module({
  imports: [RepositoryModule],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceServiceModule {}
