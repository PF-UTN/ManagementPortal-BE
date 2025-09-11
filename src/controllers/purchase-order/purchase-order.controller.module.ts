import { Module } from '@nestjs/common';

import { CreatePurchaseOrderCommandHandler } from './command/create-purchase-order.command.handler';
import { DeletePurchaseOrderCommandHandler } from './command/delete-purchase-order.command.handler';
import { UpdatePurchaseOrderStatusCommandHandler } from './command/update-purchase-order-status.command.handler';
import { UpdatePurchaseOrderCommandHandler } from './command/update-purchase-order.command.handler';
import { PurchaseOrderController } from './purchase-order.controller';
import { DownloadPurchaseOrderQueryHandler } from './query/download-purchase-order.query.handler';
import { GetPurchaseOrderByIdQueryHandler } from './query/get-purchase-order-by-id.query.handler';
import { SearchPurchaseOrderQueryHandler } from './query/search-purchase-order.query.handler';
import { PurchaseOrderServiceModule } from '../../domain/service/purchase-order/purchase-order.service.module';

const queryHandlers = [
  GetPurchaseOrderByIdQueryHandler,
  SearchPurchaseOrderQueryHandler,
  DownloadPurchaseOrderQueryHandler,
];
const commandHandlers = [
  CreatePurchaseOrderCommandHandler,
  DeletePurchaseOrderCommandHandler,
  UpdatePurchaseOrderCommandHandler,
  UpdatePurchaseOrderStatusCommandHandler,
];

@Module({
  imports: [PurchaseOrderServiceModule],
  controllers: [PurchaseOrderController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class PurchaseOrderModule {}
