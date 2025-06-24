import { Module } from '@nestjs/common';

import { CreateSupplierCommandHandler } from './command/create-supplier.command.handler';
import { SupplierByDocumentQueryHandler } from './query/supplier-by-document.query.handler';
import { SuppliersQueryHandler } from './query/suppliers.query.handler';
import { SupplierController } from './supplier.controller';
import { SupplierServiceModule } from '../../domain/service/supplier/supplier.service.module';

const queryHandlers = [SuppliersQueryHandler, SupplierByDocumentQueryHandler];

const commandHandlers = [CreateSupplierCommandHandler];

@Module({
  imports: [SupplierServiceModule],
  controllers: [SupplierController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class SupplierModule {}
