import { Module } from '@nestjs/common';
import { RegistrationRequestController } from './registration-request.controller';
import { RegistrationRequestDomainServiceModule } from '../../domain/service/registration-request/registration-request-domain.service.module';
import { SearchRegistrationRequestQueryHandler } from './command/search-registration-request-query.handler';

@Module({
  imports: [RegistrationRequestDomainServiceModule],
  controllers: [RegistrationRequestController],
  providers: [SearchRegistrationRequestQueryHandler],
})
export class RegistrationRequestModule {}
