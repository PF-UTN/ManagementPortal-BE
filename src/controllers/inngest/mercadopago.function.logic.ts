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

export const processMercadoPagoWebhookLogic = async (
  payload: any,
  dependencies: {
    webhookService: MercadoPagoWebhookService;
    orderService: OrderService;
    commandBus: CommandBus;
  },
) => {
  if (!payload?.action?.includes('payment')) return;

  const result = await dependencies.webhookService.processWebhook(payload);

  if (result?.orderId && result?.paymentStatus) {
    const order = await dependencies.orderService.findOrderByIdAsync(
      result.orderId,
    );

    const newOrderStatusId = getOrderStatusFromPaymentAndDeliveryMethod(
      result.paymentStatus as MercadoPagoPaymentStatus,
      DeliveryMethodNameToIdMap[order.deliveryMethodName],
    );

    await dependencies.commandBus.execute(
      new UpdateOrderStatusCommand(result.orderId, {
        orderStatusId: newOrderStatusId,
      }),
    );
  }
};
