import { Module } from '@nestjs/common';

import { CreatePurchaseOrderCommandHandler } from './command/create-purchase-order.command.handler';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderServiceModule } from '../../domain/service/purchase-order/purchase-order.service.module';

const commandHandlers = [CreatePurchaseOrderCommandHandler];

@Module({
  imports: [PurchaseOrderServiceModule],
  controllers: [PurchaseOrderController],
  providers: [...commandHandlers],
})
export class PurchaseOrderModule {}
