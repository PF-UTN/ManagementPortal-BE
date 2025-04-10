import { Module } from '@nestjs/common';

import {
  UserRepository,
  PrismaService,
  RegistrationRequestRepository,
  RegistrationRequestStatusRepository,
} from './services';
@Module({
  providers: [
    PrismaService,
    UserRepository,
    RegistrationRequestRepository,
    RegistrationRequestStatusRepository,
  ],
  exports: [
    UserRepository,
    RegistrationRequestRepository,
    RegistrationRequestStatusRepository,
  ],
})
export class RepositoryModule {}
