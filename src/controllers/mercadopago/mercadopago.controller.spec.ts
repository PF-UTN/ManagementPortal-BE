import { Test, TestingModule } from '@nestjs/testing';
import { SendEventOutput } from 'inngest/types';

import { MercadoPagoController } from './mercadopago.controller';
import { MercadoPagoWebhookRequest } from '../../../libs/common/src/dtos';
import { inngest } from '../../configuration/inngest.configuration';

describe('MercadoPagoController', () => {
  let controller: MercadoPagoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MercadoPagoController],
    }).compile();

    controller = module.get<MercadoPagoController>(MercadoPagoController);

    // Mock inngest.send globally for this test suite
    jest
      .spyOn(inngest, 'send')
      .mockResolvedValue({} as SendEventOutput<{ id: string }>);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should send the webhook event and return { received: true }', async () => {
    const body: MercadoPagoWebhookRequest = {
      action: 'payment.updated',
      api_version: 'v1',
      data: { id: '123456' },
      date_created: '2021-11-01T02:02:02Z',
      id: '123456',
      live_mode: false,
      type: 'payment',
      user_id: '546540802',
    };

    const request = { body } as unknown as Request;

    const result = await controller.handleWebhook(request);

    expect(inngest.send).toHaveBeenCalledWith({
      name: 'mercadopago.webhook.received',
      data: body,
    });
    expect(result).toEqual({ received: true });
  });
});
