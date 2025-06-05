import { Module } from '@nestjs/common';

import { GetAllSuppliersQueryHandler } from './query/get-all-suppliers.query.handler';
import { SupplierController } from './supplier.controller';
import { SupplierServiceModule } from '../../domain/service/supplier/supplier.service.module';

const queryHandlers = [
  GetAllSuppliersQueryHandler
];

@Module({
  imports: [
    SupplierServiceModule,
  ],
  controllers: [SupplierController],
  providers: [...queryHandlers],
})
export class SupplierModule {}
