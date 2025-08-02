import { Module } from '@nestjs/common';

import { CreatePurchaseOrderCommandHandler } from './command/create-purchase-order.command.handler';
import { PurchaseOrderController } from './purchase-order.controller';
import { SearchPurchaseOrderQueryHandler } from './query/search-purchase-order.query.handler';
import { PurchaseOrderServiceModule } from '../../domain/service/purchase-order/purchase-order.service.module';

const queryHandlers = [SearchPurchaseOrderQueryHandler];
const commandHandlers = [CreatePurchaseOrderCommandHandler];

@Module({
  imports: [PurchaseOrderServiceModule],
  controllers: [PurchaseOrderController],
  providers: [...commandHandlers,...queryHandlers],
})
export class PurchaseOrderModule {}
