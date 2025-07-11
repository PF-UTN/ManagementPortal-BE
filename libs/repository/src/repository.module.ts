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
  AddressRepository,
  VehicleRepository,
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
    AddressRepository,
    TownRepository,
    VehicleRepository,
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
    AddressRepository,
    TownRepository,
    VehicleRepository,
  ],
})
export class RepositoryModule {}
