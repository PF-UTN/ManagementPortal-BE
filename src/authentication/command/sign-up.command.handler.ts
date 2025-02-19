import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignUpCommand } from './sign-up.command';
import { AuthenticationService } from '../../domain/service/authentication.service';

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand> {
  constructor(private service: AuthenticationService) {}

  async execute(command: SignUpCommand) {
    return this.service.signUp(command.signUpDto);
  }
}
