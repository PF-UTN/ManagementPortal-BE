/* eslint-disable @typescript-eslint/no-explicit-any */
import * as wrapperModule from './mercadopago.function';
import { inngest } from '../../configuration/inngest.configuration';

jest.mock('../../configuration/inngest.configuration', () => ({
  inngest: { createFunction: jest.fn() },
}));

describe('processMercadoPagoWebhook', () => {
  it('should create an Inngest function with the correct id and event', () => {
    const webhookService = {} as any;
    const orderService = {} as any;
    const commandBus = {} as any;

    wrapperModule.processMercadoPagoWebhook({
      webhookService,
      orderService,
      commandBus,
    });

    expect(inngest.createFunction).toHaveBeenCalledWith(
      { id: 'process-mercadopago-webhook' },
      { event: 'mercadopago.webhook.received' },
      expect.any(Function),
    );
  });
});
