import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';
import { SignInCommand } from '../command/sign-in.command';

@CommandHandler(SignInCommand)
export class SignInCommandHandler implements ICommandHandler<SignInCommand> {
  constructor(private readonly service: AuthenticationService) {}

  async execute(command: SignInCommand) {
    return this.service.signInAsync(
      command.userSignInDto.email,
      command.userSignInDto.password,
    );
  }
}
