import { Command } from '@nestjs/cqrs';
import { ApproveRegistrationRequestDto } from '@mp/common/dtos';

export class ApproveRegistrationRequestCommand extends Command<void> {
  constructor(
    public readonly registrationRequestId: number,
    public readonly approveRegistrationRequestDto: ApproveRegistrationRequestDto,
  ) {
    super();
  }
}
