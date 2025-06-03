import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { SupplierService } from './supplier.service';

@Module({
  imports: [RepositoryModule],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierServiceModule {}