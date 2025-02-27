import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { SignUpCommandHandler } from './command/sign-up.command.handler';
import { UserServiceModule } from 'src/domain/service/user/user.service.module';

const commandHandlers = [SignUpCommandHandler];

@Module({
  imports: [UserServiceModule],
  controllers: [AuthenticationController],
  providers: [...commandHandlers],
})
export class AuthenticationModule {}
