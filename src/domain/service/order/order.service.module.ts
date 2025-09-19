import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { OrderService } from './order.service';
import { StockServiceModule } from '../stock/stock.service.module';

@Module({
  imports: [RepositoryModule, StockServiceModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderServiceModule {}
