import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MarkAllNotificationsAsViewedCommand } from './mark-all-notifications-as-viewed.command';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';
import { NotificationService } from '../../../domain/service/notification/notification.service';

@CommandHandler(MarkAllNotificationsAsViewedCommand)
export class MarkAllNotificationsAsViewedCommandHandler
  implements ICommandHandler<MarkAllNotificationsAsViewedCommand>
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(command: MarkAllNotificationsAsViewedCommand) {
    const token = command.authorizationHeader.split(' ')[1];

    const payload = await this.authenticationService.decodeTokenAsync(token);
    const userId = payload.sub;

    await this.notificationService.markAllNotificationsAsViewedAsync(userId);
  }
}
