import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { StockService } from './stock.service';
import { ProductServiceModule } from '../product/product.service.module';

@Module({
  imports: [RepositoryModule, ProductServiceModule],
  providers: [StockService],
  exports: [StockService],
})
export class StockServiceModule {}
