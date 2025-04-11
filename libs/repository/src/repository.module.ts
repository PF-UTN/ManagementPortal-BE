import { Module } from '@nestjs/common';
import {
  UserRepository,
  CountryRepository,
  PrismaService,
  RegistrationRequestRepository,
  RegistrationRequestStatusRepository
} from './services';
@Module({
  providers: [PrismaService, UserRepository, CountryRepository, RegistrationRequestRepository, RegistrationRequestStatusRepository],
  exports: [UserRepository, CountryRepository, RegistrationRequestRepository, RegistrationRequestStatusRepository],
})
export class RepositoryModule {}
