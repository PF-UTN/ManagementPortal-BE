import { Module } from '@nestjs/common';

import { NotificationController } from './notification.controller';
import { GetUserNotificationsQueryHandler } from './query/get-user-notifications.query.handler';
import { AuthenticationServiceModule } from '../../domain/service/authentication/authentication.service.module';
import { NotificationServiceModule } from '../../domain/service/notification/notification.service.module';

const queryHandlers = [GetUserNotificationsQueryHandler];

@Module({
  imports: [NotificationServiceModule, AuthenticationServiceModule],
  controllers: [NotificationController],
  providers: [...queryHandlers],
})
export class NotificationModule {}
