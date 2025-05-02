import { Module } from '@nestjs/common';

import {
  UserRepository,
  PrismaService,
  RegistrationRequestRepository,
  RegistrationRequestStatusRepository,
  TownRepository,
} from './services';
@Module({
  providers: [
    PrismaService,
    UserRepository,
    RegistrationRequestRepository,
    RegistrationRequestStatusRepository,
    TownRepository,
  ],
  exports: [
    UserRepository,
    RegistrationRequestRepository,
    RegistrationRequestStatusRepository,
    TownRepository,
  ],
})
export class RepositoryModule {}
