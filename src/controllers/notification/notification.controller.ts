import {
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { PermissionCodes } from '@mp/common/constants';
import { RequiredPermissions } from '@mp/common/decorators';

import { DeleteNotificationCommand } from './command/delete-notification.command';
import { MarkNotificationAsViewedCommand } from './command/mark-notification-as-viewed.command';
import { GetUserNotificationsQuery } from './query/get-user-notifications.query';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/')
  @HttpCode(200)
  @RequiredPermissions(PermissionCodes.Notification.READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user notifications',
    description:
      'Retrieves all notifications belonging to the authenticated user.',
  })
  getNotificationsByUserIdAsync(
    @Headers('Authorization')
    authorizationHeader: string,
  ) {
    return this.queryBus.execute(
      new GetUserNotificationsQuery(authorizationHeader),
    );
  }

  @Patch(':id/mark-as-viewed')
  @HttpCode(204)
  @RequiredPermissions(PermissionCodes.Notification.UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark notification as viewed',
    description: 'Mark the notification with the provided id as viewed.',
  })
  markNotificationAsViewedAsync(
    @Param('id', ParseIntPipe) id: number,
    @Headers('Authorization')
    authorizationHeader: string,
  ) {
    return this.commandBus.execute(
      new MarkNotificationAsViewedCommand(id, authorizationHeader),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @RequiredPermissions(PermissionCodes.Notification.DELETE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Delete the notification with the provided id.',
  })
  deleteNotificationAsync(
    @Param('id', ParseIntPipe) id: number,
    @Headers('Authorization')
    authorizationHeader: string,
  ) {
    return this.commandBus.execute(
      new DeleteNotificationCommand(id, authorizationHeader),
    );
  }
}
