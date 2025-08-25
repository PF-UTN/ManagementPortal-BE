import { forwardRef, Module } from '@nestjs/common';

import { RepositoryModule } from '@mp/repository';

import { ProductService } from './product.service';
import { CartServiceModule } from '../cart/cart.service.module';
import { ProductCategoryServiceModule } from '../product-category/product-category.service.module';
import { SupplierServiceModule } from '../supplier/supplier.service.module';

@Module({
  imports: [
    RepositoryModule,
    SupplierServiceModule,
    ProductCategoryServiceModule,
    forwardRef(() => CartServiceModule),
  ],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductServiceModule {}
