import { Command } from '@nestjs/cqrs';

import { RejectRegistrationRequestDto } from '@mp/common/dtos';

export class RejectRegistrationRequestCommand extends Command<void> {
  constructor(
    public readonly registrationRequestId: number,
    public readonly rejectRegistrationRequestDto: RejectRegistrationRequestDto,
  ) {
    super();
  }
}
