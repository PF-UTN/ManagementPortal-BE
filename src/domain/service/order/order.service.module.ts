import { Module } from '@nestjs/common';

import { MailingServiceModule, ReportServiceModule } from '@mp/common/services';
import { RepositoryModule } from '@mp/repository';

import { OrderService } from './order.service';
import { CartServiceModule } from '../cart/cart.service.module';
import { ClientServiceModule } from '../client/client.service.module';
import { StockServiceModule } from '../stock/stock.service.module';

@Module({
  imports: [
    RepositoryModule,
    StockServiceModule,
    ClientServiceModule,
    ReportServiceModule,
    MailingServiceModule,
    CartServiceModule,
  ],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderServiceModule {}
