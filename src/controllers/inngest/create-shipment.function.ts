/* eslint-disable @typescript-eslint/no-explicit-any */
import { OrderRepository } from '../../../libs/repository/src';
import { inngest } from '../../configuration';
import { OrderService } from '../../domain/service/order/order.service';

export const processCreateShipment = (dependencies: {
  orderService: OrderService;
  orderRepository: OrderRepository;
}) => {
  return inngest.createFunction(
    { id: 'process-create-shipment' },
    { event: 'create.shipment' },
    async ({ event, step }) => {
      const { orderService, orderRepository } = dependencies;
      const { shipment, newStatus } = event.data;

      // 🧩 STEP 1 — Find orders by shipment ID
      const orders = await orderRepository.findOrdersByShipmentIdAsync(
        shipment.id,
      );

      // 🧩 STEP 2 — Send emails flow
      const results = await Promise.all(
        orders.map(async (order: any) => {
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
