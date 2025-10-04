import { Module } from '@nestjs/common';

import { MarkNotificationAsViewedCommandHandler } from './command/mark-notification-as-viewed.command.handler';
import { NotificationController } from './notification.controller';
import { GetUserNotificationsQueryHandler } from './query/get-user-notifications.query.handler';
import { AuthenticationServiceModule } from '../../domain/service/authentication/authentication.service.module';
import { NotificationServiceModule } from '../../domain/service/notification/notification.service.module';

const queryHandlers = [GetUserNotificationsQueryHandler];
const commandHandlers = [MarkNotificationAsViewedCommandHandler];

@Module({
  imports: [NotificationServiceModule, AuthenticationServiceModule],
  controllers: [NotificationController],
  providers: [...queryHandlers, ...commandHandlers],
})
export class NotificationModule {}
