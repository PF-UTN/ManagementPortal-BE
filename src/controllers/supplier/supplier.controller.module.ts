import { Module } from '@nestjs/common';

import { SuppliersQueryHandler } from './query/suppliers.query.handler';
import { SupplierController } from './supplier.controller';
import { SupplierServiceModule } from '../../domain/service/supplier/supplier.service.module';

const queryHandlers = [
  SuppliersQueryHandler
];

@Module({
  imports: [
    SupplierServiceModule,
  ],
  controllers: [SupplierController],
  providers: [...queryHandlers],
})
export class SupplierModule {}
