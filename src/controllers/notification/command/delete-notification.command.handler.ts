import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteNotificationCommand } from './delete-notification.command';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';
import { NotificationService } from '../../../domain/service/notification/notification.service';

@CommandHandler(DeleteNotificationCommand)
export class DeleteNotificationCommandHandler
  implements ICommandHandler<DeleteNotificationCommand>
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(command: DeleteNotificationCommand) {
    const token = command.authorizationHeader.split(' ')[1];

    const payload = await this.authenticationService.decodeTokenAsync(token);
    const userId = payload.sub;

    await this.notificationService.deleteNotificationAsync(
      command.notificationId,
      userId,
    );
  }
}
