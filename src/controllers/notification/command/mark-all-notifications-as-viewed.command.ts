import { Command } from '@nestjs/cqrs';

export class MarkAllNotificationsAsViewedCommand extends Command<void> {
  constructor(public readonly authorizationHeader: string) {
    super();
  }
}
