/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaUnitOfWork } from '../../../libs/repository/src';
import { inngest } from '../../configuration';
import { OrderService } from '../../domain/service/order/order.service';

export const processSendShipment = (dependencies: {
  orderService: OrderService;
  unitOfWork: PrismaUnitOfWork;
}) => {
  return inngest.createFunction(
    { id: 'process-send-shipment' },
    { event: 'send.shipment' },
    async ({ event, step }) => {
      const { orderService, unitOfWork } = dependencies;
      const { shipment, newStatus, currentStatus } = event.data;

      // 🧩 STEP 1 — Perform stock update
      await step.run('update-stock', async () => {
        return unitOfWork.execute(async (tx) => {
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

          await Promise.all(manageStockChangesTasks);
        });
      });

      // 🧩 STEP 2 — Send emails flow
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
