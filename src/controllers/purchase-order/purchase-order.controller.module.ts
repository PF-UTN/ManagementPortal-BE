import { Module } from '@nestjs/common';

import { CreatePurchaseOrderCommandHandler } from './command/create-purchase-order.command.handler';
import { PurchaseOrderController } from './purchase-order.controller';
import { GetPurchaseOrderByIdQueryHandler } from './query/get-purchase-order-by-id.query.handler';
import { SearchPurchaseOrderQueryHandler } from './query/search-purchase-order.query.handler';
import { PurchaseOrderServiceModule } from '../../domain/service/purchase-order/purchase-order.service.module';

const queryHandlers = [GetPurchaseOrderByIdQueryHandler, SearchPurchaseOrderQueryHandler];
const commandHandlers = [CreatePurchaseOrderCommandHandler];

@Module({
  imports: [PurchaseOrderServiceModule],
  controllers: [PurchaseOrderController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class PurchaseOrderModule {}
