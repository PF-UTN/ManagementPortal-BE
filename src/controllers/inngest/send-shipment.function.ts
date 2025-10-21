/* eslint-disable @typescript-eslint/no-explicit-any */
import { ShipmentStatusId } from '../../../libs/common/src/constants';
import {
  OrderRepository,
  PrismaUnitOfWork,
  ShipmentRepository,
} from '../../../libs/repository/src';
import { inngest } from '../../configuration';
import { OrderService } from '../../domain/service/order/order.service';

export const processSendShipment = (dependencies: {
  orderService: OrderService;
  orderRepository: OrderRepository;
  shipmentRepository: ShipmentRepository;
  unitOfWork: PrismaUnitOfWork;
}) => {
  return inngest.createFunction(
    { id: 'process-send-shipment' },
    { event: 'send.shipment' },
    async ({ event, step }) => {
      const { orderService, orderRepository, shipmentRepository, unitOfWork } =
        dependencies;
      const { shipment, newStatus, currentStatus } = event.data;

      // 🧩 STEP 1 — Get order ids
      const orderIds = shipment.orders.map((order: any) => order.id);

      // 🧩 STEP 2 — Perform unit of work (status update + stock changes)
      await step.run('update-order-stock-and-shipment', async () => {
        return unitOfWork.execute(async (tx) => {
          const updateOrderTask = orderRepository.updateManyOrderStatusAsync(
            orderIds,
            newStatus,
            tx,
          );

          const manageStockChangesTasks = shipment.orders.map((order: any) =>
            orderService.manageStockChangesAsync(
              order,
              order.orderItems,
              order.paymentDetail.paymentTypeId,
              currentStatus,
              newStatus,
              tx,
            ),
          );

          const shipmentUpdateTask = shipmentRepository.updateShipmentAsync(
            shipment.id,
            { statusId: ShipmentStatusId.Shipped },
            tx,
          );

          await Promise.all([
            updateOrderTask,
            manageStockChangesTasks,
            shipmentUpdateTask,
          ]);
          return updateOrderTask;
        });
      });

      // 🧩 STEP 3 — Conditional flow
      const results = await Promise.all(
        shipment.orders.map(async (order: any) => {
          await step.run('send-status-change-email', async () => {
            await orderService.sendOrderStatusChangeEmailAsync(
              order,
              newStatus,
            );
          });

          return {
            orderId: order.id,
            message: 'Status updated and email sent.',
          };
        }),
      );

      return { results };
    },
  );
};
