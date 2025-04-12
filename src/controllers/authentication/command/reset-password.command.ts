import { ResetPasswordDto } from '@mp/common/dtos';
import { Command } from '@nestjs/cqrs';

export class ResetPasswordCommand extends Command<void> {
  constructor(public readonly token: string, public readonly resetPasswordDto: ResetPasswordDto) {
    super();
  }
}
