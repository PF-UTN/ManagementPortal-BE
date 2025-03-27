import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationRequestStatusId } from '@mp/common/constants';
import { MailingService } from '@mp/common/services';
import { ApproveRegistrationRequestCommand } from './approve-registration-request.command';
import { RegistrationRequestDomainService } from '../../../domain/service/registration-request/registration-request-domain.service';
import { UserService } from '../../../domain/service/user/user.service';

@CommandHandler(ApproveRegistrationRequestCommand)
export class ApproveRegistrationRequestCommandHandler
  implements ICommandHandler<ApproveRegistrationRequestCommand>
{
  constructor(
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

    if (registrationRequest.statusId !== RegistrationRequestStatusId.Pending) {
      throw new BadRequestException(
        'The registration request status cannot be modified.',
      );
    }

    const updatedRegistrationRequest =
      await this.registrationRequestService.updateRegistrationRequestStatusAsync(
        {
          registrationRequestId: command.registrationRequestId,
          status: { connect: { id: RegistrationRequestStatusId.Approved } },
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
