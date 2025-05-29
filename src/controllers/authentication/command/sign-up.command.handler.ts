import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SignUpCommand } from './sign-up.command';
import { UserService } from '../../../domain/service/user/user.service';

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: SignUpCommand) {
    const user = await this.userService.createUserWithRegistrationRequestAsync(
      command.userCreationDto,
    );

    return user;
  }
}
