import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignInCommand } from '../command/sign-in.command';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';

@CommandHandler(SignInCommand)
export class SignInCommandHandler implements ICommandHandler<SignInCommand> {
  constructor(private readonly service: AuthenticationService) {}

  async execute(command: SignInCommand) {
    return this.service.signInAsync(command.userSignInDto.email, command.userSignInDto.password);
  }
}
