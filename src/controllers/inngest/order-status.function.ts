import { Decimal } from '@prisma/client/runtime/library';

import {
  deliveryMethodTranslations,
  OrderStatusId,
  PaymentTypeTranslations,
} from '../../../libs/common/src/constants';
import { OrderDetailsDto } from '../../../libs/common/src/dtos';
import {
  OrderRepository,
  BillRepository,
  BillItemRepository,
  PrismaUnitOfWork,
} from '../../../libs/repository/src';
import { inngest } from '../../configuration';
import { OrderService } from '../../domain/service/order/order.service';

export const processOrderStatusChange = (dependencies: {
  orderService: OrderService;
  orderRepository: OrderRepository;
  billRepository: BillRepository;
  billItemRepository: BillItemRepository;
  unitOfWork: PrismaUnitOfWork;
}) => {
  return inngest.createFunction(
    { id: 'process-order-status-change' },
    { event: 'order.status.change' },
    async ({ event, step }) => {
      const {
        orderService,
        orderRepository,
        billRepository,
        billItemRepository,
        unitOfWork,
      } = dependencies;
      const { orderId, newStatus, currentStatus } = event.data;

      // 🧩 STEP 1 — Get order
      const orderFromRepo = await step.run('load-order', async () => {
        return orderRepository.findOrderByIdAsync(orderId);
      });

      const order = orderFromRepo!;
      // 🧩 STEP 2 — Perform unit of work (status update + stock changes)
      await step.run('update-order-and-stock', async () => {
        return unitOfWork.execute(async (tx) => {
          const updateOrderTask = orderRepository.updateOrderAsync(order.id, {
            orderStatusId: newStatus,
          });

          const manageStockChangesTask = orderService.manageStockChangesAsync(
            order,
            order.orderItems,
            order.paymentDetail.paymentTypeId,
            currentStatus,
            newStatus,
            tx,
          );

          await Promise.all([updateOrderTask, manageStockChangesTask]);
          return updateOrderTask;
        });
      });

      // 🧩 STEP 3 — Get order
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderDetails: any = await step.run(
        'load-order-details',
        async () => {
          return await orderService.findOrderByIdAsync(orderId);
        },
      );

      if (
        orderDetails?.createdAt &&
        typeof orderDetails.createdAt === 'string'
      ) {
        orderDetails.createdAt = new Date(orderDetails.createdAt);
      }

      // 🧩 STEP 4 — Conditional flow
      if (newStatus !== OrderStatusId.Finished) {
        await step.run('send-status-change-email', async () => {
          await orderService.sendOrderStatusChangeEmailAsync(
            orderDetails as OrderDetailsDto,
            newStatus,
          );
        });
        return { message: 'Order status updated and email sent.' };
      }

      if (newStatus === OrderStatusId.Finished) {
        const bill = await step.run('create-bill', async () => {
          return unitOfWork.execute(async (tx) => {
            const bill = await billRepository.createBillAsync(
              {
                beforeTaxPrice: new Decimal(orderDetails.totalAmount),
                totalPrice: new Decimal(order.totalAmount),
                orderId: order.id,
              },
              tx,
            );

            const billItemsToCreate = order.orderItems.map((item) => ({
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
          orderItems: order.orderItems.map((item) => ({
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
          const updatedDetails = await orderService.findOrderByIdAsync(orderId);
          await orderService.sendBillByEmailAsync(
            updatedDetails,
            newStatus,
            billReportGenerationDataDto,
            order.client.user.email,
          );
        });

        return { message: 'Order finished, bill created, and email sent.' };
      }
    },
  );
};
