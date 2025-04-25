import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RegistrationRequestStatusId } from '@mp/common/constants';
import { PrismaService } from '@mp/repository';

import { SignUpCommand } from './sign-up.command';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { UserService } from '../../../domain/service/user/user.service';

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly registrationRequestService: RegistrationRequestDomainService,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(command: SignUpCommand) {
    return this.prismaService.$transaction(async (tx) => {
      const user = await this.userService.createUserAsync(
        command.userCreationDto,
        tx,
      );
      await this.registrationRequestService.createRegistrationRequestAsync(
        {
          user: { connect: { id: user.id } },
          status: { connect: { id: RegistrationRequestStatusId.Pending } },
        },
        tx,
      );

      return user;
    });
  }
}
