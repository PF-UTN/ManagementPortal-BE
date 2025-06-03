import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { ProductCategoryService } from './product-category.service';

@Module({
  imports: [RepositoryModule],
  providers: [ProductCategoryService],
  exports: [ProductCategoryService],
})
export class ProductCategoryServiceModule {}