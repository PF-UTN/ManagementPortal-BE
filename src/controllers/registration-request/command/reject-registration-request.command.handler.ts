import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RegistrationRequestStatusId } from '@mp/common/constants';
import { MailingService } from '@mp/common/services';

import { RejectRegistrationRequestCommand } from './reject-registration-request.command';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { UserService } from '../../../domain/service/user/user.service';

@CommandHandler(RejectRegistrationRequestCommand)
export class RejectRegistrationRequestCommandHandler
  implements ICommandHandler<RejectRegistrationRequestCommand>
{
  constructor(
    private readonly registrationRequestService: RegistrationRequestDomainService,
    private readonly userService: UserService,
    private readonly mailingService: MailingService,
  ) {}

  async execute(command: RejectRegistrationRequestCommand) {
    const registrationRequest =
      await this.registrationRequestService.findRegistrationRequestByIdAsync(
        command.registrationRequestId,
      );

    if (!registrationRequest) {
      throw new NotFoundException(
        `Cannot find a registration request with id ${command.registrationRequestId}`,
      );
    }

    if (registrationRequest.statusId !== RegistrationRequestStatusId.Pending) {
      throw new BadRequestException(
        'The registration request status cannot be modified.',
      );
    }

    const updatedRegistrationRequest =
      await this.registrationRequestService.updateRegistrationRequestStatusAsync(
        {
          registrationRequestId: command.registrationRequestId,
          status: { connect: { id: RegistrationRequestStatusId.Rejected } },
          note: command.rejectRegistrationRequestDto.note,
        },
      );

    const user = await this.userService.findByIdAsync(
      updatedRegistrationRequest.userId,
    );

    if (!user) {
      throw new NotFoundException(
        `Cannot find a user with id ${updatedRegistrationRequest.userId}`,
      );
    }

    await this.mailingService.sendRegistrationRequestRejectedEmailAsync(
      user.email,
      command.rejectRegistrationRequestDto.note!,
    );
  }
}
