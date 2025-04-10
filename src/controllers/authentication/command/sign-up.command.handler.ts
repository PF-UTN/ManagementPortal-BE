import { RegistrationRequestStatusId } from '@mp/common/constants';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SignUpCommand } from './sign-up.command';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { UserService } from '../../../domain/service/user/user.service';

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly registrationRequestService: RegistrationRequestDomainService,
  ) {}

  async execute(command: SignUpCommand) {
    const user = await this.userService.createUserAsync(
      command.userCreationDto,
    );

    await this.registrationRequestService.createRegistrationRequestAsync({
      user: { connect: { id: user.id } },
      status: { connect: { id: RegistrationRequestStatusId.Pending } },
    });

    return user;
  }
}
