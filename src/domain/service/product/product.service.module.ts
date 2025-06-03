import { Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { ProductService } from './product.service';
import { ProductCategoryServiceModule } from '../product-category/product-category.service.module';
import { SupplierServiceModule } from '../supplier/supplier.service.module';

@Module({
  imports: [RepositoryModule, SupplierServiceModule, ProductCategoryServiceModule],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductServiceModule {}