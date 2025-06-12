import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { SupplierService } from './supplier.service';
import { TownServiceModule } from '../town/town.service.module';

@Module({
  imports: [RepositoryModule, TownServiceModule],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierServiceModule {}
