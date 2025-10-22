/* eslint-disable @typescript-eslint/no-explicit-any */
import { Decimal } from '@prisma/client/runtime/library';
import { addMonths, subMonths } from 'date-fns';

import { mapOrderToOrderDetailsDto } from '@mp/common/helpers';

import {
  deliveryMethodTranslations,
  OrderStatusId,
  PaymentTypeTranslations,
} from '../../../libs/common/src/constants';
import {
  BillItemRepository,
  BillRepository,
  MaintenancePlanItemRepository,
  NotificationRepository,
  OrderRepository,
  PrismaUnitOfWork,
  UserRepository,
  VehicleRepository,
  VehicleUsageRepository,
} from '../../../libs/repository/src';
import { inngest } from '../../configuration';
import { OrderService } from '../../domain/service/order/order.service';

export const processFinishShipment = (dependencies: {
  orderService: OrderService;
  orderRepository: OrderRepository;
  vehicleUsageRepository: VehicleUsageRepository;
  vehicleRepository: VehicleRepository;
  billRepository: BillRepository;
  billItemRepository: BillItemRepository;
  maintenancePlanItemRepository: MaintenancePlanItemRepository;
  userRepository: UserRepository;
  notificationRepository: NotificationRepository;
  unitOfWork: PrismaUnitOfWork;
}) => {
  return inngest.createFunction(
    { id: 'process-finish-shipment' },
    { event: 'finish.shipment' },
    async ({ event, step }) => {
      const {
        orderService,
        orderRepository,
        vehicleUsageRepository,
        vehicleRepository,
        billItemRepository,
        billRepository,
        maintenancePlanItemRepository,
        userRepository,
        notificationRepository,
        unitOfWork,
      } = dependencies;
      const { shipment, finishShipmentDto, vehicleUsageCreationDataDto } =
        event.data;

      // 🧩 STEP 1 - Map new order status
      const newOrderStatusEntries = (await step.run(
        'load-new-order-status-map',
        async () => {
          return finishShipmentDto.orders.map((o: any) => [
            o.orderId,
            o.orderStatusId,
          ]);
        },
      )) as [number, number][];

      const newOrderStatusMap = new Map<number, number>(newOrderStatusEntries);

      // 🧩 STEP 2 — Get updated orders
      const shipmentOrders = await step.run(
        'load-shipment-orders',
        async () => {
          return await orderRepository.findOrdersByShipmentIdAsync(shipment.id);
        },
      );

      // 🧩 STEP 3 — Perform unit of work (stock update + vehicle update + vehicleUsage creation)
      await step.run('update-stock-vehicle-and-create-vehicle-usage', async () => {
        return unitOfWork.execute(async (tx) => {
          const manageStockChangesTasks = shipment.orders.map((order: any) => {
            const oldStatus = order.orderStatusId;
            const newStatus = newOrderStatusMap.get(order.id);

            return orderService.manageStockChangesAsync(
              order,
              order.orderItems,
              order.paymentDetail.paymentTypeId,
              oldStatus,
              newStatus!,
              tx,
            );
          });

          const vehicleUsageCreationTask =
            vehicleUsageRepository.createVehicleUsageAsync(
              vehicleUsageCreationDataDto,
              tx,
            );

          const vehicleUpdateTask =
            vehicleRepository.updateVehicleKmTraveledAsync(
              shipment.vehicleId,
              finishShipmentDto.odometer,
              tx,
            );

          await Promise.all([
            ...manageStockChangesTasks,
            vehicleUsageCreationTask,
            vehicleUpdateTask,
          ]);
        });
      });

      // 🧩 STEP 4 — Conditional flow
      const results = await Promise.all(
        shipmentOrders.map(async (order) => {
          if (newOrderStatusMap.get(order.id) !== OrderStatusId.Finished) {
            const mappedOrder = mapOrderToOrderDetailsDto(order);
            await step.run('send-status-change-email', async () => {
              await orderService.sendOrderStatusChangeEmailAsync(
                mappedOrder,
                newOrderStatusMap.get(order.id)!,
              );
            });

            return {
              orderId: order.id,
              message: 'Status updated and email sent.',
            };
          }

          const bill = await step.run('create-bill', async () => {
            return unitOfWork.execute(async (tx) => {
              const bill = await billRepository.createBillAsync(
                {
                  beforeTaxPrice: new Decimal(order.totalAmount),
                  totalPrice: new Decimal(order.totalAmount),
                  orderId: order.id,
                },
                tx,
              );

              const billItemsToCreate = order.orderItems.map((item: any) => ({
                subTotalPrice: new Decimal(item.subtotalPrice),
                billId: bill.id,
              }));

              await billItemRepository.createManyBillItemAsync(
                billItemsToCreate,
                tx,
              );

              return bill;
            });
          });

          const billReportGenerationDataDto = {
            billId: bill.id,
            orderId: order.id,
            clientCompanyName: order.client.companyName,
            clientAddress: `${order.client.address.street} ${order.client.address.streetNumber}`,
            clientDocumentType: order.client.user.documentType,
            clientDocumentNumber: order.client.user.documentNumber,
            clientTaxCategory: order.client.taxCategory.name,
            deliveryMethod:
              deliveryMethodTranslations[order.deliveryMethod.name] ||
              order.deliveryMethod.name,
            totalAmount: new Decimal(order.totalAmount),
            orderItems: order.orderItems.map((item: any) => ({
              productName: item.product.name,
              unitPrice: new Decimal(item.unitPrice),
              quantity: item.quantity,
              subtotalPrice: new Decimal(item.subtotalPrice),
            })),
            paymentType:
              PaymentTypeTranslations[order.paymentDetail.paymentType.name] ||
              order.paymentDetail.paymentType.name,
            observation: '',
            createdAt: new Date(),
          };

          await step.run('send-bill-email', async () => {
            const updatedDetails = await orderService.findOrderByIdAsync(
              order.id,
            );
            await orderService.sendBillByEmailAsync(
              updatedDetails,
              OrderStatusId.Finished,
              billReportGenerationDataDto,
              order.client.user.email,
            );
          });

          return {
            orderId: order.id,
            message: 'Order finished, bill created, and email sent.',
          };
        }),
      );

      // 🧩 STEP 5 — Find admins
      const findAdminstask = step.run('find-admins', async () => {
        const admins = await userRepository.findAdminsAsync();
        return admins;
      });

      // 🧩 STEP 6 — Find maintenancePlanItems
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

      // 🧩 STEP 7 — Generate notifications
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

      return { results };
    },
  );
};
