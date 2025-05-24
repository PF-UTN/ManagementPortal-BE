import { Module } from '@nestjs/common';

import {
  UserRepository,
  PrismaService,
  RegistrationRequestRepository,
  RegistrationRequestStatusRepository,
  TownRepository,
  ProductRepository,
  PrismaUnitOfWork,
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
  ],
  exports: [
    UserRepository,
    RegistrationRequestRepository,
    RegistrationRequestStatusRepository,
    TownRepository,
    ProductRepository,
    PrismaUnitOfWork,
  ],
})
export class RepositoryModule {}
