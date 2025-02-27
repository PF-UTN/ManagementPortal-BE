import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { SignUpCommandHandler } from './command/sign-up.command.handler';
import { SignInCommandHandler } from './command/sign-in.command.handler';
import { UserServiceModule } from '../../domain/service/user/user.service.module';
import { AuthenticationServiceModule } from '../../domain/service/authentication/authentication.service.module';

const commandHandlers = [SignUpCommandHandler, SignInCommandHandler];

@Module({
  imports: [AuthenticationServiceModule, UserServiceModule],
  controllers: [AuthenticationController],
  providers: [...commandHandlers],
})
export class AuthenticationModule {}
