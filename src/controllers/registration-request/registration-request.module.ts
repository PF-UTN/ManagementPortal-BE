import { Module } from '@nestjs/common';

import { MailingServiceModule } from '@mp/common/services';

import { ApproveRegistrationRequestCommandHandler } from './command/approve-registration-request.command.handler';
import { RejectRegistrationRequestCommandHandler } from './command/reject-registration-request.command.handler';
import { SearchRegistrationRequestQueryHandler } from './command/search-registration-request-query.handler';
import { GetRegistrationRequestByIdQueryHandler } from './query/get-registration-request-by-id.query.handler';
import { RegistrationRequestController } from './registration-request.controller';
import { RegistrationRequestDomainServiceModule } from '../../domain/service/registration-request/registration-request-domain.service.module';
import { RegistrationRequestStatusServiceModule } from '../../domain/service/registration-request-status/registration-request-status.service.module';
import { UserServiceModule } from '../../domain/service/user/user.service.module';

const commandHandlers = [
  ApproveRegistrationRequestCommandHandler,
  RejectRegistrationRequestCommandHandler,
];
const queryHandlers = [
  SearchRegistrationRequestQueryHandler,
  GetRegistrationRequestByIdQueryHandler,
];

@Module({
  imports: [
    RegistrationRequestDomainServiceModule,
    RegistrationRequestStatusServiceModule,
    UserServiceModule,
    MailingServiceModule,
  ],
  controllers: [RegistrationRequestController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class RegistrationRequestModule {}
