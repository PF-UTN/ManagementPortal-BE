import { Module } from '@nestjs/common';

import { MailingServiceModule } from '@mp/common/services';
import { PrismaService } from '@mp/repository';

import { AuthenticationController } from './authentication.controller';
import { ResetPasswordCommandHandler } from './command/reset-password.command.handler';
import { SignInCommandHandler } from './command/sign-in.command.handler';
import { SignUpCommandHandler } from './command/sign-up.command.handler';
import { ResetPasswordRequestQueryHandler } from './query/reset-password-request.query.handler';
import { AuthenticationServiceModule } from '../../domain/service/authentication/authentication.service.module';
import { RegistrationRequestDomainServiceModule } from '../../domain/service/registration-request/registration-request-domain.service.module';
import { RegistrationRequestStatusServiceModule } from '../../domain/service/registration-request-status/registration-request-status.service.module';
import { UserServiceModule } from '../../domain/service/user/user.service.module';

const commandHandlers = [
  SignUpCommandHandler,
  SignInCommandHandler,
  ResetPasswordCommandHandler,
];
const queryHandlers = [ResetPasswordRequestQueryHandler];

@Module({
  imports: [
    AuthenticationServiceModule,
    UserServiceModule,
    RegistrationRequestDomainServiceModule,
    RegistrationRequestStatusServiceModule,
    MailingServiceModule,
  ],
  controllers: [AuthenticationController],
  providers: [...commandHandlers, ...queryHandlers, PrismaService],
})
export class AuthenticationModule {}
