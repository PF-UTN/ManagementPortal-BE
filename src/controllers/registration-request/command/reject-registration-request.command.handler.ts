import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationRequestStatus } from '@mp/common/constants';
import { MailingService } from '@mp/common/services';
import { RegistrationRequestStatusService } from '../../../domain/service/registration-request-status/registration-request-status.service';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { UserService } from '../../../domain/service/user/user.service';
import { RejectRegistrationRequestCommand } from './reject-registration-request.command';

@CommandHandler(RejectRegistrationRequestCommand)
export class RejectRegistrationRequestCommandHandler
  implements ICommandHandler<RejectRegistrationRequestCommand>
{
  constructor(
    private readonly registrationRequestStatusService: RegistrationRequestStatusService,
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

    if (registrationRequest.status.code !== RegistrationRequestStatus.Pending) {
      throw new BadRequestException(
        'The registration request status cannot be modified.',
      );
    }

    const rejectedStatus =
      await this.registrationRequestStatusService.findByCodeAsync(
        RegistrationRequestStatus.Rejected,
      );

    if (!rejectedStatus) {
      throw new Error(
        `RegistrationRequestStatus with code="${RegistrationRequestStatus.Rejected}" not found`,
      );
    }

    const updatedRegistrationRequest =
      await this.registrationRequestService.updateRegistrationRequestStatusAsync(
        {
          registrationRequestId: command.registrationRequestId,
          status: { connect: { id: rejectedStatus.id } },
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
      user.email, command.rejectRegistrationRequestDto.note!,
    );
  }
}
