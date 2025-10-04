import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MarkNotificationAsViewedCommand } from './mark-notification-as-viewed.command';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';
import { NotificationService } from '../../../domain/service/notification/notification.service';

@CommandHandler(MarkNotificationAsViewedCommand)
export class MarkNotificationAsViewedCommandHandler
  implements ICommandHandler<MarkNotificationAsViewedCommand>
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(command: MarkNotificationAsViewedCommand) {
    const token = command.authorizationHeader.split(' ')[1];

    const payload = await this.authenticationService.decodeTokenAsync(token);
    const userId = payload.sub;

    await this.notificationService.markNotificationAsViewedAsync(
      command.notificationId,
      userId,
    );
  }
}
