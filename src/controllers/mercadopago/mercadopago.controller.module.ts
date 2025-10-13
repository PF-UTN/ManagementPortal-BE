import { Module } from '@nestjs/common';

import { MercadoPagoController } from './mercadopago.controller';
import { MercadoPagoServiceModule } from '../../../libs/common/src/services';
import { OrderServiceModule } from '../../domain/service/order/order.service.module';
import { MercadoPagoWebhookServiceModule } from '../../services/mercadopago-webhook.service.module';

@Module({
  imports: [
    MercadoPagoServiceModule,
    MercadoPagoWebhookServiceModule,
    OrderServiceModule,
  ],
  controllers: [MercadoPagoController],
})
export class MercadoPagoModule {}
