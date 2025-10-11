import { Injectable } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';

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

  async findByIdAsync(id: number): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id, deleted: false },
    });
  }

  async updateManyNotificationsByUserIdAsync(
    userId: number,
    data: Prisma.NotificationUpdateInput,
  ) {
    return this.prisma.notification.updateMany({
      where: { userId, viewed: false, deleted: false },
      data,
    });
  }

  async createAsync(userId: number, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }

  async existsSimilarNotificationAsync(userId: number, message: string) {
    return this.prisma.notification.findFirst({
      where: { userId, message },
    });
  }
}
