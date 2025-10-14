import { CommandBus } from '@nestjs/cqrs';

import { MercadoPagoPaymentStatus } from '@mp/common/constants';

import {
  processWebhookStep,
  retrieveOrderStep,
  updateOrderStatusStep,
} from './mercadopago.function.logic';
import { inngest } from '../../configuration/inngest.configuration';
import { OrderService } from '../../domain/service/order/order.service';
import { MercadoPagoWebhookService } from '../../services/mercadopago-webhook.service';

/**
 * Inngest function for processing Mercado Pago webhooks
 *
 * @param dependencies injected NestJS services
 * @returns an Inngest function
 */
export const processMercadoPagoWebhook = (dependencies: {
  webhookService: MercadoPagoWebhookService;
  orderService: OrderService;
  commandBus: CommandBus;
}) => {
  return inngest.createFunction(
    {
      id: 'process-mercadopago-webhook',
      timeouts: { start: '5m' },
    },
    { event: 'mercadopago.webhook.received' },
    async ({ event, step }) => {
      const payload = event.data;

      // Step 1: Process webhook (can be parallelized)
      const result = await step.run('process-webhook', () =>
        processWebhookStep(payload, dependencies.webhookService),
      );
      if (!result?.orderId || !result?.paymentStatus) return;

      // Step 2: Retrieve order (depends on step 1)
      const order = await step.run('retrieve-order', () =>
        retrieveOrderStep(result.orderId, dependencies.orderService),
      );
      if (!order) return;

      // Step 3: Update order status (depends on step 2)
      await step.run('update-order-status', () =>
        updateOrderStatusStep(
          result.orderId,
          order,
          result.paymentStatus as MercadoPagoPaymentStatus,
          dependencies.commandBus,
        ),
      );
    },
  );
};
