import { Command } from '@nestjs/cqrs';

export class MarkNotificationAsViewedCommand extends Command<void> {
  constructor(
    public readonly notificationId: number,
    public readonly authorizationHeader: string,
  ) {
    super();
  }
}
