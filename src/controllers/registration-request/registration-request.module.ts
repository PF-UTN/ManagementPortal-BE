import { Module } from '@nestjs/common';
import { MailingServiceModule } from '@mp/common/services';
import { RegistrationRequestController } from './registration-request.controller';
import { RegistrationRequestDomainServiceModule } from '../../domain/service/registration-request/registration-request-domain.service.module';
import { SearchRegistrationRequestQueryHandler } from './command/search-registration-request-query.handler';
import { ApproveRegistrationRequestCommandHandler } from './command/approve-registration-request.command.handler';
import { RegistrationRequestStatusServiceModule } from '../../domain/service/registration-request-status/registration-request-status.service.module';
import { UserServiceModule } from '../../domain/service/user/user.service.module';
import { RejectRegistrationRequestCommandHandler } from './command/reject-registration-request.command.handler';
import { GetRegistrationRequestByIdQueryHandler } from './query/get-registration-request-by-id.query.handler';

const commandHandlers = [ApproveRegistrationRequestCommandHandler, RejectRegistrationRequestCommandHandler];
const queryHandlers = [SearchRegistrationRequestQueryHandler, GetRegistrationRequestByIdQueryHandler];

@Module({
  imports: [
    RegistrationRequestDomainServiceModule,
    RegistrationRequestStatusServiceModule,
    UserServiceModule,
    MailingServiceModule
  ],
  controllers: [RegistrationRequestController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class RegistrationRequestModule {}
