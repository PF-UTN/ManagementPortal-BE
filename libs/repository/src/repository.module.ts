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
    PrismaUnitOfWork,
    ClientRepository,
    AddressRepository,
    TownRepository,
  ],
})
export class RepositoryModule {}
