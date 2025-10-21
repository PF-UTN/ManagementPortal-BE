import { INestApplication } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import bodyParser from 'body-parser';
import express from 'express';
import { Inngest } from 'inngest';
import { serve } from 'inngest/express';

import {
  BillItemRepository,
  BillRepository,
  MaintenancePlanItemRepository,
  NotificationRepository,
  OrderRepository,
  PrismaUnitOfWork,
  ShipmentRepository,
  UserRepository,
  VehicleRepository,
  VehicleUsageRepository,
} from '../../libs/repository/src';
import { processCreateShipment } from '../controllers/inngest/create-shipment.function';
import { processFinishShipment } from '../controllers/inngest/finish-shipment.function';
import { processMercadoPagoWebhook } from '../controllers/inngest/mercadopago.function';
import { processOrderStatusChange } from '../controllers/inngest/order-status.function';
import { processSendShipment } from '../controllers/inngest/send-shipment.function';
import { OrderService } from '../domain/service/order/order.service';
import { MercadoPagoWebhookService } from '../services/mercadopago-webhook.service';

export const inngest = new Inngest({
  id: 'Management Portal',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export const IngestConfiguration = (app: INestApplication) => {
  const webhookService = app.get(MercadoPagoWebhookService);
  const orderService = app.get(OrderService);
  const orderRepository = app.get(OrderRepository);
  const shipmentRepository = app.get(ShipmentRepository);
  const vehicleUsageRepository = app.get(VehicleUsageRepository);
  const vehicleRepository = app.get(VehicleRepository);
  const billItemRepository = app.get(BillItemRepository);
  const billRepository = app.get(BillRepository);
  const maintenancePlanItemRepository = app.get(MaintenancePlanItemRepository);
  const userRepository = app.get(UserRepository);
  const notificationRepository = app.get(NotificationRepository);
  const unitOfWork = app.get(PrismaUnitOfWork);
  const commandBus = app.get(CommandBus);

  const inngestFunctions = [
    processMercadoPagoWebhook({
      webhookService,
      orderService,
      commandBus,
    }),
    processOrderStatusChange({
      orderService,
      orderRepository,
      billItemRepository,
      billRepository,
      unitOfWork,
    }),
    processSendShipment({
      orderService,
      orderRepository,
      shipmentRepository,
      unitOfWork,
    }),
    processCreateShipment({
      orderService,
      orderRepository,
      shipmentRepository,
      unitOfWork,
    }),
    processFinishShipment({
      orderService,
      orderRepository,
      shipmentRepository,
      vehicleUsageRepository,
      vehicleRepository,
      billItemRepository,
      billRepository,
      maintenancePlanItemRepository,
      userRepository,
      notificationRepository,
      unitOfWork,
    }),
  ];

  const router = express.Router();

  router.use(bodyParser.json());
  const signingKey = process.env.INNGEST_SIGNING_KEY;

  if (!signingKey) {
    throw new Error(
      'INNGEST_SIGNING_KEY is required. Please set it in your environment variables.',
    );
  }

  router.use(
    serve({
      client: inngest,
      functions: inngestFunctions,
      streaming: 'force',
      signingKey,
    }),
  );

  app.use('/api/inngest', router);
};
