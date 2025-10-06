import { QueryHandler } from '@nestjs/cqrs';

import { GetUserNotificationsDto } from '@mp/common/dtos';

import { GetUserNotificationsQuery } from './get-user-notifications.query';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';
import { NotificationService } from '../../../domain/service/notification/notification.service';

@QueryHandler(GetUserNotificationsQuery)
export class GetUserNotificationsQueryHandler {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(query: GetUserNotificationsQuery) {
    const token = query.authorizationHeader.split(' ')[1];

    const payload = await this.authenticationService.decodeTokenAsync(token);
    const userId = payload.sub;
    const notifications =
      await this.notificationService.getNotificationsByUserIdAsync(userId);

    const mappedResponse = notifications.map(
      (notification): GetUserNotificationsDto => {
        return {
          id: notification.id,
          timestamp: notification.timestamp,
          message: notification.message,
          viewed: notification.viewed,
        };
      },
    );

    return mappedResponse;
  }
}
