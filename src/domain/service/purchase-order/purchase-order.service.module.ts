import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { PurchaseOrderService } from './purchase-order.service';
import { StockServiceModule } from '../stock/stock.service.module';

@Module({
  imports: [RepositoryModule, StockServiceModule],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderServiceModule {}
