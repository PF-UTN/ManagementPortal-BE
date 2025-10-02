import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNotificationsByUserIdAsync(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId, deleted: false },
      orderBy: { timestamp: 'desc' },
    });
  }

  async updateNotificationAsync(
    id: number,
    data: Prisma.NotificationUpdateInput,
  ) {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }
}
