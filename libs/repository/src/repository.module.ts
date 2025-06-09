import { Module } from '@nestjs/common';

import {
  UserRepository,
  PrismaService,
  RegistrationRequestRepository,
  RegistrationRequestStatusRepository,
  TownRepository,
  ProductRepository,
  PrismaUnitOfWork,
  ClientRepository,
  ProductCategoryRepository,
  SupplierRepository,
  StockRepository,
} from './services';
@Module({
  providers: [
    PrismaService,
    UserRepository,
    RegistrationRequestRepository,
    RegistrationRequestStatusRepository,
    TownRepository,
    ProductRepository,
    ProductCategoryRepository,
    PrismaUnitOfWork,
    ClientRepository,
    ProductCategoryRepository,
    SupplierRepository,
    StockRepository,
  ],
  exports: [
    UserRepository,
    RegistrationRequestRepository,
    RegistrationRequestStatusRepository,
    TownRepository,
    ProductRepository,
    ProductCategoryRepository,
    PrismaUnitOfWork,
    ClientRepository,
    ProductCategoryRepository,
    SupplierRepository,
    StockRepository,
  ],
})
export class RepositoryModule {}
