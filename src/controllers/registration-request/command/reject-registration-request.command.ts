import { RejectRegistrationRequestDto } from '@mp/common/dtos';
import { Command } from '@nestjs/cqrs';

export class RejectRegistrationRequestCommand extends Command<void> {
  constructor(
    public readonly registrationRequestId: number,
    public readonly rejectRegistrationRequestDto: RejectRegistrationRequestDto,
  ) {
    super();
  }
}
