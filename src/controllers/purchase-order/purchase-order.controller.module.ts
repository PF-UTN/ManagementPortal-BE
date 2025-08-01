import { Module } from '@nestjs/common';

import { CreatePurchaseOrderCommandHandler } from './command/create-purchase-order.command.handler';
import { DeletePurchaseOrderCommandHandler } from './command/delete-purchase-order.command.handler';
import { PurchaseOrderController } from './purchase-order.controller';
import { GetPurchaseOrderByIdQueryHandler } from './query/get-purchase-order-by-id.query.handler';
import { PurchaseOrderServiceModule } from '../../domain/service/purchase-order/purchase-order.service.module';

const queryHandlers = [GetPurchaseOrderByIdQueryHandler];
const commandHandlers = [
  CreatePurchaseOrderCommandHandler,
  DeletePurchaseOrderCommandHandler,
];

@Module({
  imports: [PurchaseOrderServiceModule],
  controllers: [PurchaseOrderController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class PurchaseOrderModule {}
