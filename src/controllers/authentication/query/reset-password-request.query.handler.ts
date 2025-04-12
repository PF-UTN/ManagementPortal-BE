import { MailingService } from '@mp/common/services';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ResetPasswordRequestQuery } from './reset-password-request.query';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';

@QueryHandler(ResetPasswordRequestQuery)
export class ResetPasswordRequestQueryHandler
  implements IQueryHandler<ResetPasswordRequestQuery>
{
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly mailingService: MailingService,
  ) {}

  async execute(query: ResetPasswordRequestQuery) {
    const token = await this.authenticationService.requestPasswordResetAsync(
      query.resetPasswordRequestDto.email,
    );

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL ?? 'http://localhost:4200';
    const url = frontendBaseUrl + '/reset-password/' + token;

    await this.mailingService.sendPasswordResetEmailAsync(
      query.resetPasswordRequestDto.email,
      url,
    );
  }
}
