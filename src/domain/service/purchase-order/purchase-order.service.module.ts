import { Module } from '@nestjs/common';

import { MailingServiceModule, ReportServiceModule } from '@mp/common/services';
import { RepositoryModule } from '@mp/repository';

import { PurchaseOrderService } from './purchase-order.service';
import { StockServiceModule } from '../stock/stock.service.module';

@Module({
  imports: [
    RepositoryModule,
    StockServiceModule,
    MailingServiceModule,
    ReportServiceModule,
  ],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderServiceModule {}
