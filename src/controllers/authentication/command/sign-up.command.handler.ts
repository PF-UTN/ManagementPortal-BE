import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationRequestStatus } from '@mp/common/constants';
import { SignUpCommand } from './sign-up.command';
import { UserService } from '../../../domain/service/user/user.service';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { RegistrationRequestStatusService } from '../../../domain/service/registration-request-status/registration-request-status.service';

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly registrationRequestStatusService: RegistrationRequestStatusService,
    private readonly registrationRequestService: RegistrationRequestDomainService,
  ) {}

  async execute(command: SignUpCommand) {
    const user = await this.userService.createUserAsync(
      command.userCreationDto,
    );
    const status =
      await this.registrationRequestStatusService.findByCodeAsync(RegistrationRequestStatus.Pending);

    if (!status) {
      throw new Error(
        'RegistrationRequestStatus with code="Pending" not found',
      );
    }

    await this.registrationRequestService.createRegistrationRequestAsync({
      user: { connect: { id: user.id } },
      status: { connect: { id: status.id } },
      note: '',
    });

    return user;
  }
}
