import { Module } from '@nestjs/common';

import { MercadoPagoWebhookService } from './mercadopago-webhook.service';
import { MercadoPagoServiceModule } from '../../libs/common/src/services';
import { RepositoryModule } from '../../libs/repository/src';

@Module({
  imports: [RepositoryModule, MercadoPagoServiceModule],
  providers: [MercadoPagoWebhookService],
  exports: [MercadoPagoWebhookService],
})
export class MercadoPagoWebhookServiceModule {}
