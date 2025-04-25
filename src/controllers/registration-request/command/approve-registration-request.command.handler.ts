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
        `No se puede encontrar una solicitud de registro con ID ${command.registrationRequestId}.`,
      );
    }

    if (registrationRequest.statusId !== RegistrationRequestStatusId.Pending) {
      throw new BadRequestException(
        'El estado de la solicitud de registro no puede ser modificado.',
      );
    }

    const updatedRegistrationRequest =
      await this.registrationRequestService.updateRegistrationRequestStatusAsync(
        {
          registrationRequestId: command.registrationRequestId,
          status: { connect: { id: RegistrationRequestStatusId.Approved } },
          note: command.approveRegistrationRequestDto?.note,
        },
      );

    const user = await this.userService.findByIdAsync(
      updatedRegistrationRequest.userId,
    );

    if (!user) {
      throw new NotFoundException(
        `No se puede encontrar un usuario con ID ${updatedRegistrationRequest.userId}.`,
      );
    }

    await this.mailingService.sendRegistrationRequestApprovedEmailAsync(
      user.email,
    );
  }
}
