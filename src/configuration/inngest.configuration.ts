import { INestApplication } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import bodyParser from 'body-parser';
import express from 'express';
import { Inngest } from 'inngest';
import { serve } from 'inngest/express';

import { processMercadoPagoWebhook } from '../controllers/inngest/mercadopago.function';
import { OrderService } from '../domain/service/order/order.service';
import { MercadoPagoWebhookService } from '../services/mercadopago-webhook.service';

export const inngest = new Inngest({
  id: 'Management Portal',
});

export const IngestConfiguration = (app: INestApplication) => {
  const webhookService = app.get(MercadoPagoWebhookService);
  const orderService = app.get(OrderService);
  const commandBus = app.get(CommandBus);

  const inngestFunctions = [
    processMercadoPagoWebhook({
      webhookService,
      orderService,
      commandBus,
    }),
  ];

  const router = express.Router();

  router.use(bodyParser.json());

  router.use(
    serve({
      client: inngest,
      functions: inngestFunctions,
      streaming: 'force',
    }),
  );

  app.use('/api/inngest', router);
};
