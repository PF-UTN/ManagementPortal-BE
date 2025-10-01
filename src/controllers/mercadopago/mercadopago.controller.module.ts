import { Module } from '@nestjs/common';

import { ProcessMercadoPagoWebhookHandler } from './command/mercadopago-webhook.command.handler';
import { MercadoPagoController } from './mercadopago.controller';
import { MercadoPagoServiceModule } from '../../../libs/common/src/services';
import { OrderServiceModule } from '../../domain/service/order/order.service.module';
import { MercadoPagoWebhookServiceModule } from '../../services/mercadopago-webhook.service.module';

const commandHandlers = [ProcessMercadoPagoWebhookHandler];

@Module({
  imports: [
    MercadoPagoServiceModule,
    MercadoPagoWebhookServiceModule,
    OrderServiceModule,
  ],
  controllers: [MercadoPagoController],
  providers: [...commandHandlers],
})
export class MercadoPagoModule {}
