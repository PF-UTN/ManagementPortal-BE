import { Controller, Post, HttpCode, Req } from '@nestjs/common';

import { Public } from '@mp/common/decorators';

import { inngest } from '../../configuration/inngest.configuration';

@Controller('mercadopago')
export class MercadoPagoController {
  @Post('webhook')
  @Public()
  @HttpCode(200)
  async handleWebhook(@Req() request: Request) {
    await inngest.send({
      name: 'mercadopago.webhook.received',
      data: request.body,
    });
    return { received: true };
  }
}
