import { RepositoryModule } from '@mp/repository';
import { Module } from '@nestjs/common';

import { RegistrationRequestStatusService } from './registration-request-status.service';

@Module({
  imports: [RepositoryModule],
  providers: [RegistrationRequestStatusService],
  exports: [RegistrationRequestStatusService],
})
export class RegistrationRequestStatusServiceModule {}
