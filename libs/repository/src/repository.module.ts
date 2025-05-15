import { Module } from '@nestjs/common';

import {
  UserRepository,
  PrismaService,
  RegistrationRequestRepository,
  RegistrationRequestStatusRepository,
  TownRepository,
  PrismaUnitOfWork,
} from './services';
@Module({
  providers: [
    PrismaService,
    UserRepository,
    RegistrationRequestRepository,
    RegistrationRequestStatusRepository,
    TownRepository,
    PrismaUnitOfWork,
  ],
  exports: [
    UserRepository,
    RegistrationRequestRepository,
    RegistrationRequestStatusRepository,
    TownRepository,
    PrismaUnitOfWork,
  ],
})
export class RepositoryModule {}
