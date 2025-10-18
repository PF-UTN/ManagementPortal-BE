/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  OrderRepository,
  PrismaUnitOfWork,
  ShipmentRepository,
} from '../../../libs/repository/src';
import { inngest } from '../../configuration';
import { OrderService } from '../../domain/service/order/order.service';

export const processCreateShipment = (dependencies: {
  orderService: OrderService;
  orderRepository: OrderRepository;
  shipmentRepository: ShipmentRepository;
  unitOfWork: PrismaUnitOfWork;
}) => {
  return inngest.createFunction(
    { id: 'process-create-shipment' },
    { event: 'create.shipment' },
    async ({ event, step }) => {
      const { orderService, orderRepository, shipmentRepository, unitOfWork } =
        dependencies;
      const { shipment, newStatus } = event.data;

      // 🧩 STEP 1 — Get order ids
      const orderIds = shipment.orderIds;

      // 🧩 STEP 2 — Perform unit of work (status update + stock changes)
      const createdShipment = await step.run(
        'create-shipment-and-update-orders',
        async () => {
          return unitOfWork.execute(async (tx) => {
            const updateOrdersTask = orderRepository.updateManyOrderStatusAsync(
              orderIds,
              newStatus,
              tx,
            );

            const shipmentCreationTask = shipmentRepository.createShipmentAsync(
              shipment,
              tx,
            );

            const [, createdShipment] = await Promise.all([
              updateOrdersTask,
              shipmentCreationTask,
            ]);
            return createdShipment;
          });
        },
      );

      // 🧩 STEP 3 — Find orders by shipment ID
      const orders = await orderRepository.findOrdersByShipmentIdAsync(
        createdShipment.id,
      );

      // 🧩 STEP 4 — Conditional flow
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
