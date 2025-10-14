/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandBus } from '@nestjs/cqrs';

import {
  DeliveryMethodNameToIdMap,
  getOrderStatusFromPaymentAndDeliveryMethod,
  MercadoPagoPaymentStatus,
} from '@mp/common/constants';

import { OrderService } from '../../domain/service/order/order.service';
import { MercadoPagoWebhookService } from '../../services/mercadopago-webhook.service';
import { UpdateOrderStatusCommand } from '../order/command/update-order-status.command';

export const processWebhookStep = async (
  payload: any,
  webhookService: MercadoPagoWebhookService,
) => {
  if (!payload?.action?.includes('payment')) {
    console.log('Ignored non-payment webhook');
    return null;
  }
  return await webhookService.processWebhook(payload);
};

export const retrieveOrderStep = async (
  orderId: number,
  orderService: OrderService,
) => {
  const order = await orderService.findOrderByIdAsync(orderId);
  if (!order) console.log(`Order not found: ${orderId}`);
  return order;
};

export const updateOrderStatusStep = async (
  orderId: number,
  order: any,
  paymentStatus: MercadoPagoPaymentStatus,
  commandBus: CommandBus,
) => {
  const newOrderStatusId = getOrderStatusFromPaymentAndDeliveryMethod(
    paymentStatus,
    DeliveryMethodNameToIdMap[order.deliveryMethodName],
  );

  await commandBus.execute(
    new UpdateOrderStatusCommand(orderId, { orderStatusId: newOrderStatusId }),
  );
};
