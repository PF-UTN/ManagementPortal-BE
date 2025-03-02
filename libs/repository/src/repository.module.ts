import { Module } from '@nestjs/common';
import { UserRepository, PrismaService, RegistrationRequestRepository } from './services';
@Module({
  providers: [PrismaService, UserRepository, RegistrationRequestRepository],
  exports: [UserRepository, RegistrationRequestRepository],
})
export class RepositoryModule {}
