import { Query } from '@nestjs/cqrs';
import { Notification } from '@prisma/client';

export class GetUserNotificationsQuery extends Query<Notification[]> {
  constructor(public readonly authorizationHeader: string) {
    super();
  }
}
