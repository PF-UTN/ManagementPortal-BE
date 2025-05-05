import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ResetPasswordCommand } from './reset-password.command';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(private readonly service: AuthenticationService) {}

  async execute(command: ResetPasswordCommand) {
    const { authorizationHeader, resetPasswordDto } = command;
    const token = authorizationHeader.split(' ')[1];

    await this.service.resetPasswordAsync(token, resetPasswordDto.password);
  }
}
