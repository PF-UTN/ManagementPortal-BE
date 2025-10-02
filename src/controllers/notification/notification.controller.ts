import { Controller, Get, Headers, HttpCode } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';

import { GetUserNotificationsQuery } from './query/get-user-notifications.query';

@Controller('notification')
export class NotificationController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Notification.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get suppliers data',
    description: 'Retrieve a list of suppliers with their details.',
  })
  getNotificationsByUserIdAsync(
    @Headers('Authorization')
    authorizationHeader: string,
  ) {
    return this.queryBus.execute(
      new GetUserNotificationsQuery(authorizationHeader),
    );
  }
}
