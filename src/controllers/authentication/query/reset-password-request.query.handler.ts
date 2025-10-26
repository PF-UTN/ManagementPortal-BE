import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { MailingService } from '@mp/common/services';

import { ResetPasswordRequestQuery } from './reset-password-request.query';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';

@QueryHandler(ResetPasswordRequestQuery)
export class ResetPasswordRequestQueryHandler
  implements IQueryHandler<ResetPasswordRequestQuery>
{
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly mailingService: MailingService,
    private readonly configService: ConfigService
  ) {}

  async execute(query: ResetPasswordRequestQuery) {
    const token = await this.authenticationService.requestPasswordResetAsync(
      query.resetPasswordRequestDto.email,
    );

    if(!token) {
      return;
    }

    const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL');
    const url = frontendBaseUrl + '/autenticacion/restablecimiento-clave/' + token;

    await this.mailingService.sendPasswordResetEmailAsync(
      query.resetPasswordRequestDto.email,
      url,
    );
  }
}
