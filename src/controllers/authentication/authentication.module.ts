import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { SignUpCommandHandler } from './command/sign-up.command.handler';
import { AuthenticationServiceModule } from '../../domain/service/authentication/authentication.service.module';

const commandHandlers = [SignUpCommandHandler];

@Module({
  imports: [AuthenticationServiceModule],
  controllers: [AuthenticationController],
  providers: [...commandHandlers],
})
export class AuthenticationModule {}
