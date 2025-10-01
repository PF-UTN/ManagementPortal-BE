import { Controller, Post, HttpCode, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ProcessMercadoPagoWebhookCommand } from './command/mercadopago-webhook.command';
import { Public } from '../../../libs/common/src/decorators';
import { MercadoPagoWebhookRequest } from '../../../libs/common/src/dtos/mercado-pago/mercadopago-request.dto';

@Controller('mercadopago')
export class MercadoPagoController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('webhook')
  @Public()
  @HttpCode(200)
  async handleWebhook(@Req() request: Request) {
    await this.commandBus.execute(
      new ProcessMercadoPagoWebhookCommand(
        request.body as unknown as MercadoPagoWebhookRequest,
      ),
    );
    return { received: true };
  }
}
