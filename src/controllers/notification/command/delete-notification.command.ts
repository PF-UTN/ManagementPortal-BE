import { Command } from '@nestjs/cqrs';

export class DeleteNotificationCommand extends Command<void> {
  constructor(
    public readonly notificationId: number,
    public readonly authorizationHeader: string,
  ) {
    super();
  }
}
