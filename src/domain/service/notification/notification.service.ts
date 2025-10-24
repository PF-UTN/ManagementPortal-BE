import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import {
  MaintenancePlanItemRepository,
  NotificationRepository,
  UserRepository,
} from '@mp/repository';

import { inngest } from '../../../configuration';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly maintenancePlanItemRepository: MaintenancePlanItemRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getNotificationsByUserIdAsync(userId: number) {
    return await this.notificationRepository.getNotificationsByUserIdAsync(
      userId,
    );
  }

  async markNotificationAsViewedAsync(notificationId: number, userId: number) {
    const notification =
      await this.notificationRepository.findByIdAsync(notificationId);

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(
        `Notification with id ${notificationId} do not exists.`,
      );
    }

    return await this.notificationRepository.updateNotificationAsync(
      notificationId,
      { viewed: true },
    );
  }

  async deleteNotificationAsync(notificationId: number, userId: number) {
    const notification =
      await this.notificationRepository.findByIdAsync(notificationId);

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(
        `Notification with id ${notificationId} do not exists.`,
      );
    }

    return await this.notificationRepository.updateNotificationAsync(
      notificationId,
      { deleted: true },
    );
  }

  async markAllNotificationsAsViewedAsync(userId: number) {
    return await this.notificationRepository.updateManyNotificationsByUserIdAsync(
      userId,
      { viewed: true },
    );
  }

  @Cron('0 0,12 * * *')
  async generateMaintenanceNotificationsAsync() {
    await inngest.send({
      name: 'generate.maintenance.notifications',
    });
  }
}
