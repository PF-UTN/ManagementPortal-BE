import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { ServiceSupplierService } from './service-supplier.service';
import { TownServiceModule } from '../town/town.service.module';

@Module({
  imports: [RepositoryModule, TownServiceModule],
  providers: [ServiceSupplierService],
  exports: [ServiceSupplierService],
})
export class ServiceSupplierServiceModule {}
