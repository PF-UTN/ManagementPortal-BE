import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { PurchaseOrderService } from './purchase-order.service';

@Module({
  imports: [RepositoryModule],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderServiceModule {}
