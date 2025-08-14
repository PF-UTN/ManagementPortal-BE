import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { MaintenancePlanItemService } from './maintenance-plan-item.service';

@Module({
  imports: [RepositoryModule],
  providers: [MaintenancePlanItemService],
  exports: [MaintenancePlanItemService],
})
export class MaintenancePlanItemServiceModule {}
