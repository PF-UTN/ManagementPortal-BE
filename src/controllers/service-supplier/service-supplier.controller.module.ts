import { Module } from '@nestjs/common';

import { CreateServiceSupplierCommandHandler } from './command/create-service-supplier.command.handler';
import { GetServiceSupplierByIdQueryHandler } from './query/get-service-supplier-by-id.query.handler';
import { SearchServiceSupplierQueryHandler } from './query/search-service-supplier.query.handler';
import { ServiceSupplierController } from './service-supplier.controller';
import { ServiceSupplierServiceModule } from '../../domain/service/service-supplier/service-supplier.service.module';

const queryHandlers = [
  GetServiceSupplierByIdQueryHandler,
  SearchServiceSupplierQueryHandler,
];

const commandHandlers = [CreateServiceSupplierCommandHandler];

@Module({
  imports: [ServiceSupplierServiceModule],
  controllers: [ServiceSupplierController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class ServiceSupplierModule {}
