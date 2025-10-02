import { Injectable } from '@nestjs/common';

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
}
