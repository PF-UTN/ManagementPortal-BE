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
    SupplierRepository,
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
    SupplierRepository,
  ],
})
export class RepositoryModule {}
