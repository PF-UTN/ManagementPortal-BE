/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { mapOrderToOrderDetailsDto } from '@mp/common/helpers';

import {
  deliveryMethodTranslations,
  OrderStatusId,
  PaymentTypeTranslations,
  ShipmentStatusId,
} from '../../../libs/common/src/constants';
import {
  BillItemRepository,
  BillRepository,
  OrderRepository,
  PrismaUnitOfWork,
  ShipmentRepository,
  VehicleRepository,
  VehicleUsageRepository,
} from '../../../libs/repository/src';
import { inngest } from '../../configuration';
import { NotificationService } from '../../domain/service/notification/notification.service';
import { OrderService } from '../../domain/service/order/order.service';

export const processFinishShipment = (dependencies: {
  orderService: OrderService;
  orderRepository: OrderRepository;
  shipmentRepository: ShipmentRepository;
  vehicleUsageRepository: VehicleUsageRepository;
  vehicleRepository: VehicleRepository;
  billRepository: BillRepository;
  billItemRepository: BillItemRepository;
  notificationService: NotificationService;
  unitOfWork: PrismaUnitOfWork;
}) => {
  return inngest.createFunction(
    { id: 'process-finish-shipment' },
    { event: 'finish.shipment' },
    async ({ event, step }) => {
      const {
        orderService,
        orderRepository,
        shipmentRepository,
        vehicleUsageRepository,
        vehicleRepository,
        billItemRepository,
        billRepository,
        notificationService,
        unitOfWork,
      } = dependencies;
      const {
        shipment,
        finishShipmentDto,
        lastOdometer,
        vehicleUsageCreationDataDto,
      } = event.data;

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

      // 🧩 STEP 3 — Perform unit of work (status update + stock changes + shipment update + vehicle update + vehicleUsage creation)
      await step.run('update-order-stock-and-shipment', async () => {
        return unitOfWork.execute(async (tx) => {
          const orderUpdateTasks = finishShipmentDto.orders.map(
            (order: any) => {
              const data: Prisma.OrderUncheckedUpdateInput = {
                orderStatusId: order.orderStatusId,
              };

              if (order.orderStatusId === OrderStatusId.Pending) {
                data.shipmentId = null;
              }

              return orderRepository.updateOrderAsync(order.orderId, data, tx);
            },
          );

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

          const shipmentUpdateTask = shipmentRepository.updateShipmentAsync(
            shipment.id,
            {
              statusId: ShipmentStatusId.Finished,
              finishedAt: finishShipmentDto.finishedAt,
              effectiveKm: finishShipmentDto.odometer - Number(lastOdometer),
            },
            tx,
          );

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
            ...orderUpdateTasks,
            ...manageStockChangesTasks,
            shipmentUpdateTask,
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

      // 🧩 STEP 5 — Generate maintenance notifications
      await step.run('generate-maintenance-notifications', async () => {
        await notificationService.generateMaintenanceNotificationsAsync();
      });

      return { results };
    },
  );
};
