import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { ProcessMercadoPagoWebhookCommand } from './command/mercadopago-webhook.command';
import { MercadoPagoController } from './mercadopago.controller';
import { MercadoPagoWebhookRequest } from '../../../libs/common/src/dtos/mercado-pago/mercadopago-request.dto';

describe('MercadoPagoController', () => {
  let controller: MercadoPagoController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MercadoPagoController],
      providers: [{ provide: CommandBus, useValue: { execute: jest.fn() } }],
    }).compile();

    controller = module.get<MercadoPagoController>(MercadoPagoController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should execute ProcessMercadoPagoWebhookCommand and return { received: true }', async () => {
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
    const executeSpy = jest
      .spyOn(commandBus, 'execute')
      .mockResolvedValue(undefined);

    const result = await controller.handleWebhook(request);

    expect(executeSpy).toHaveBeenCalledWith(
      new ProcessMercadoPagoWebhookCommand(body),
    );
    expect(result).toEqual({ received: true });
  });
});
