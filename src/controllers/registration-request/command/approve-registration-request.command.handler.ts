import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationRequestStatus } from '@mp/common/constants';
import { MailingService } from '@mp/common/services';
import { ApproveRegistrationRequestCommand } from './approve-registration-request.command';
import { RegistrationRequestStatusService } from '../../../domain/service/registration-request-status/registration-request-status.service';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { UserService } from '../../../domain/service/user/user.service';

@CommandHandler(ApproveRegistrationRequestCommand)
export class ApproveRegistrationRequestCommandHandler
  implements ICommandHandler<ApproveRegistrationRequestCommand>
{
  constructor(
    private readonly registrationRequestStatusService: RegistrationRequestStatusService,
    private readonly registrationRequestService: RegistrationRequestDomainService,
    private readonly userService: UserService,
    private readonly mailingService: MailingService,
  ) {}

  async execute(command: ApproveRegistrationRequestCommand) {
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

    const approvedStatus =
      await this.registrationRequestStatusService.findByCodeAsync(
        RegistrationRequestStatus.Approved,
      );

    if (!approvedStatus) {
      throw new Error(
        `RegistrationRequestStatus with code="${RegistrationRequestStatus.Approved}" not found`,
      );
    }

    const updatedRegistrationRequest =
      await this.registrationRequestService.updateRegistrationRequestStatusAsync(
        {
          registrationRequestId: command.registrationRequestId,
          status: { connect: { id: approvedStatus.id } },
          note: command.approveRegistrationRequestDto?.note ?? '',
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

    await this.mailingService.sendRegistrationRequestApprovedEmailAsync(
      user.email,
    );
  }
}
