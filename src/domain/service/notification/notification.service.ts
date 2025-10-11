import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { addMonths, subMonths } from 'date-fns';

import {
  MaintenancePlanItemRepository,
  NotificationRepository,
  UserRepository,
} from '@mp/repository';

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
    const maintenancePlanItems =
      await this.maintenancePlanItemRepository.findAllWithRelationsAsync();
    const admins = await this.userRepository.findAdminsAsync();

    for (const maintenancePlanItem of maintenancePlanItems) {
      const { vehicle, maintenanceItem, kmInterval, timeInterval } =
        maintenancePlanItem;
      const lastMaintenance = maintenancePlanItem.maintenances[0];
      const currentKm = vehicle.kmTraveled;
      const currentDate = new Date();

      const lastKm = lastMaintenance ? lastMaintenance.kmPerformed : 0;
      const lastDate = lastMaintenance
        ? lastMaintenance.date
        : vehicle.createdAt;

      let nextKm: number | null = null;
      let nextDate: Date | null = null;
      let kmThreshold: number | null = null;
      let dateThreshold: Date | null = null;

      if (kmInterval !== null) {
        nextKm = lastKm + kmInterval;
        kmThreshold = nextKm - kmInterval * 0.05;
      }

      if (timeInterval !== null) {
        nextDate = addMonths(lastDate, timeInterval);
        dateThreshold = subMonths(nextDate, timeInterval * 0.05);
      }

      let shouldNotify = false;

      if (kmInterval !== null && nextKm !== null && kmThreshold !== null) {
        if (currentKm >= kmThreshold) {
          shouldNotify = true;
        }
      }

      if (
        timeInterval !== null &&
        nextDate !== null &&
        dateThreshold !== null
      ) {
        if (currentDate >= dateThreshold) {
          shouldNotify = true;
        }
      }

      if (!shouldNotify) continue;

      let message: string;

      if (kmInterval !== null && timeInterval !== null) {
        message = `Se debe realizar ${maintenanceItem.description} al vehículo ${vehicle.brand} ${vehicle.model} con patente ${vehicle.licensePlate} cuando se llegue a los ${nextKm} km o en la fecha ${nextDate!.toLocaleDateString()}.`;
      } else if (kmInterval !== null) {
        message = `Se debe realizar ${maintenanceItem.description} al vehículo ${vehicle.brand} ${vehicle.model} con patente ${vehicle.licensePlate} cuando se llegue a los ${nextKm} km.`;
      } else {
        message = `Se debe realizar ${maintenanceItem.description} al vehículo ${vehicle.brand} ${vehicle.model} con patente ${vehicle.licensePlate} en la fecha ${nextDate!.toLocaleDateString()}.`;
      }

      for (const admin of admins) {
        const alreadyExists =
          await this.notificationRepository.existsSimilarNotificationAsync(
            admin.id,
            message,
          );

        if (!alreadyExists) {
          await this.notificationRepository.createAsync(admin.id, message);
        }
      }
    }
  }
}
