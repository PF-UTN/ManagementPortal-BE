/* eslint-disable @typescript-eslint/no-explicit-any */
import { Decimal } from '@prisma/client/runtime/library';
import { CartRepository } from 'libs/repository/src/services/cart/cart.repository';
import { ClientService } from 'src/domain/service/client/client.service';

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
  clientService: ClientService;
  cartRepository: CartRepository;
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
        clientService,
        cartRepository,
      } = dependencies;
      const { orderId, newStatus, currentStatus } = event.data;

      // 🧩 STEP 1 — Get order
      const orderFromRepo = await step.run('load-order', async () => {
        return orderRepository.findOrderByIdAsync(orderId);
      });

      const order = orderFromRepo!;

      //CONDITIONAL STEP - If status is changed to Pending, empty client cart
      if (newStatus === OrderStatusId.Pending) {
        await step.run('empty-client-cart', async () => {
          const client = await clientService.findClientByIdAsync(
            order.clientId,
          );
          if (!client) {
            return { message: 'Client not found.' };
          }
          cartRepository.emptyCartAsync(client.user.id);
        });
      }

      // 🧩 STEP 2 — Perform unit of work (status update + stock changes)
      await step.run('update-order-and-stock', async () => {
        return unitOfWork.execute(async (tx) => {
          await orderService.manageStockChangesAsync(
            order,
            order.orderItems,
            order.paymentDetail.paymentTypeId,
            currentStatus,
            newStatus,
            tx,
          );
        });
      });

      // 🧩 STEP 3 — Get order
      const orderDetails = (await step.run('load-order-details', async () => {
        return await orderService.findOrderByIdAsync(orderId);
      })) as any as OrderDetailsDto;

      // 🧩 STEP 4 — Conditional flow
      if (newStatus !== OrderStatusId.Finished) {
        await step.run('send-status-change-email', async () => {
          await orderService.sendOrderStatusChangeEmailAsync(
            orderDetails,
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
