import { Command } from '@nestjs/cqrs';

import { ResetPasswordDto } from '@mp/common/dtos';

export class ResetPasswordCommand extends Command<void> {
  constructor(
    public readonly authorizationHeader: string,
    public readonly resetPasswordDto: ResetPasswordDto,
  ) {
    super();
  }
}
