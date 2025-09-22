import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { OrderService } from './order.service';
import { ClientServiceModule } from '../client/client.service.module';
import { StockServiceModule } from '../stock/stock.service.module';

@Module({
  imports: [RepositoryModule, StockServiceModule, ClientServiceModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderServiceModule {}
