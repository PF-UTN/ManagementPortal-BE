import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ResetPasswordCommand } from './reset-password.command';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(private readonly service: AuthenticationService) {}

    async execute(command: ResetPasswordCommand) {
        const { token, resetPasswordDto } = command;

        if(resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
          throw new BadRequestException('Passwords do not match');
        }

        await this.service.resetPasswordAsync(token, resetPasswordDto.password);
    }
}
