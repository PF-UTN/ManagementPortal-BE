import { RepositoryModule } from '@mp/repository';
import { Module } from '@nestjs/common';

import { RegistrationRequestDomainService } from './registration-request-domain.service';

@Module({
  imports: [RepositoryModule],
  providers: [RegistrationRequestDomainService],
  exports: [RegistrationRequestDomainService],
})
export class RegistrationRequestDomainServiceModule {}
