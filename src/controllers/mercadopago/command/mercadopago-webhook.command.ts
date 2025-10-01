import { Command } from '@nestjs/cqrs';

import { MercadoPagoWebhookRequest } from '../../../../libs/common/src/dtos/mercado-pago/mercadopago-request.dto';

export class ProcessMercadoPagoWebhookCommand extends Command<void> {
  constructor(public readonly payload: MercadoPagoWebhookRequest) {
    super();
  }
}
