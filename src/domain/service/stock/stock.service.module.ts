import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { StockService } from './stock.service';

@Module({
  imports: [RepositoryModule],
  providers: [StockService],
  exports: [StockService],
})
export class StockServiceModule {}
