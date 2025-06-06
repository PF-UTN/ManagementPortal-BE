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
  AddressRepository,
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
    AddressRepository,
    TownRepository,
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
    AddressRepository,
    TownRepository,
  ],
})
export class RepositoryModule {}
