import { CommandBus } from '@nestjs/cqrs';

import { processMercadoPagoWebhookLogic } from './mercadopago.function.logic';
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
      await step.run('process-payment', async () => {
        await processMercadoPagoWebhookLogic(event.data, dependencies);
      });
    },
  );
};
