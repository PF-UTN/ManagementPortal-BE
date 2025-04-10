import { ApproveRegistrationRequestDto } from '@mp/common/dtos';
import { Command } from '@nestjs/cqrs';

export class ApproveRegistrationRequestCommand extends Command<void> {
  constructor(
    public readonly registrationRequestId: number,
    public readonly approveRegistrationRequestDto: ApproveRegistrationRequestDto,
  ) {
    super();
  }
}
