import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { RepairService } from './repair.service';

@Module({
  imports: [RepositoryModule],
  providers: [RepairService],
  exports: [RepairService],
})
export class RepairServiceModule {}
