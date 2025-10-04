import { Injectable, NotFoundException } from '@nestjs/common';

import { NotificationRepository } from '@mp/repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
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
}
