import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { ProductService } from './product.service';

@Module({
  imports: [RepositoryModule],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductServiceModule {}