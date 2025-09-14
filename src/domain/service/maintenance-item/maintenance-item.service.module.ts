import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { MaintenanceItemService } from './maintenance-item.service';

@Module({
  imports: [RepositoryModule],
  providers: [MaintenanceItemService],
  exports: [MaintenanceItemService],
})
export class MaintenanceItemServiceModule {}
