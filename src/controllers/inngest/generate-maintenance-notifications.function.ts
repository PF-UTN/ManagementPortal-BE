import { addMonths, subMonths } from 'date-fns';

import {
  MaintenancePlanItemRepository,
  NotificationRepository,
  UserRepository,
} from '../../../libs/repository/src';
import { inngest } from '../../configuration';

export const processGenerateMaintenanceNotificationsCronJob = (dependencies: {
  maintenancePlanItemRepository: MaintenancePlanItemRepository;
  userRepository: UserRepository;
  notificationRepository: NotificationRepository;
}) => {
  return inngest.createFunction(
    { id: 'process-generate-maintenance-notifications-cron-job' },
    { event: 'generate.maintenance.notifications' },
    async ({ step }) => {
      const {
        maintenancePlanItemRepository,
        userRepository,
        notificationRepository,
      } = dependencies;

      // 🧩 STEP 1 — Find admins
      const findAdminstask = step.run('find-admins', async () => {
        const admins = await userRepository.findAdminsAsync();
        return admins;
      });

      // 🧩 STEP 2 — Find maintenancePlanItems
      const findMaintenancePlanItemsTask = step.run(
        'find-maintenance-plan-items',
        async () => {
          return await maintenancePlanItemRepository.findAllWithRelationsAsync();
        },
      );

      const [admins, maintenancePlanItems] = await Promise.all([
        findAdminstask,
        findMaintenancePlanItemsTask,
      ]);

      // 🧩 STEP 3 — Generate notifications
      const notificationStepTasks = [];

      for (const maintenancePlanItem of maintenancePlanItems) {
        notificationStepTasks.push(
          step.run('generate-maintenance-notifications', async () => {
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

            if (
              kmInterval !== null &&
              nextKm !== null &&
              kmThreshold !== null
            ) {
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

            if (!shouldNotify) return;

            let message: string;

            if (kmInterval !== null && timeInterval !== null) {
              message = `Se debe realizar ${maintenanceItem.description} al vehículo ${vehicle.brand} ${vehicle.model} con patente ${vehicle.licensePlate} cuando se llegue a los ${nextKm} km o en la fecha ${nextDate!.toLocaleDateString()}.`;
            } else if (kmInterval !== null) {
              message = `Se debe realizar ${maintenanceItem.description} al vehículo ${vehicle.brand} ${vehicle.model} con patente ${vehicle.licensePlate} cuando se llegue a los ${nextKm} km.`;
            } else {
              message = `Se debe realizar ${maintenanceItem.description} al vehículo ${vehicle.brand} ${vehicle.model} con patente ${vehicle.licensePlate} en la fecha ${nextDate!.toLocaleDateString()}.`;
            }

            const generateMaintenanceNotificationsTasks = [];

            for (const admin of admins) {
              const generateMaintenanceNotificationTask = (async () => {
                const alreadyExists =
                  await notificationRepository.existsSimilarNotificationAsync(
                    admin.id,
                    message,
                  );

                if (!alreadyExists) {
                  return notificationRepository.createAsync(admin.id, message);
                }
              })();

              generateMaintenanceNotificationsTasks.push(
                generateMaintenanceNotificationTask,
              );
            }

            return Promise.all(generateMaintenanceNotificationsTasks);
          }),
        );
      }

      await Promise.all(notificationStepTasks);
    },
  );
};
