/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandBus } from '@nestjs/cqrs';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { processMercadoPagoWebhookLogic } from './mercadopago.function.logic';
import {
  DeliveryMethodNameToIdMap,
  getOrderStatusFromPaymentAndDeliveryMethod,
  MercadoPagoPaymentStatus,
} from '../../../libs/common/src/constants';
import { OrderService } from '../../domain/service/order/order.service';
import { MercadoPagoWebhookService } from '../../services/mercadopago-webhook.service';
import { UpdateOrderStatusCommand } from '../order/command/update-order-status.command';

describe('processMercadoPagoWebhookLogic', () => {
  let webhookService: DeepMockProxy<MercadoPagoWebhookService>;
  let orderService: DeepMockProxy<OrderService>;
  let commandBus: DeepMockProxy<CommandBus>;

  beforeEach(() => {
    webhookService = mockDeep<MercadoPagoWebhookService>();
    orderService = mockDeep<OrderService>();
    commandBus = mockDeep<CommandBus>();
  });

  it('should return early if action does not include payment', async () => {
    const payload = { action: 'non-pay' };
    await processMercadoPagoWebhookLogic(payload, {
      webhookService,
      orderService,
      commandBus,
    });

    expect(webhookService.processWebhook).not.toHaveBeenCalled();
    expect(orderService.findOrderByIdAsync).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('should process webhook and update order status when valid payment webhook', async () => {
    const mockOrderId = 123;
    const mockPaymentStatus = MercadoPagoPaymentStatus.Approved;
    const mockDeliveryMethod = 'HOME_DELIVERY';
    const payload = { action: 'payment.created' };

    webhookService.processWebhook.mockResolvedValue({
      orderId: mockOrderId,
      paymentStatus: mockPaymentStatus,
    });
    orderService.findOrderByIdAsync.mockResolvedValue({
      id: mockOrderId,
      deliveryMethodName: mockDeliveryMethod,
    } as any);

    const expectedOrderStatusId = getOrderStatusFromPaymentAndDeliveryMethod(
      mockPaymentStatus,
      DeliveryMethodNameToIdMap[mockDeliveryMethod],
    );

    await processMercadoPagoWebhookLogic(payload, {
      webhookService,
      orderService,
      commandBus,
    });

    expect(webhookService.processWebhook).toHaveBeenCalledWith(payload);
    expect(orderService.findOrderByIdAsync).toHaveBeenCalledWith(mockOrderId);
    expect(commandBus.execute).toHaveBeenCalledWith(
      new UpdateOrderStatusCommand(mockOrderId, {
        orderStatusId: expectedOrderStatusId,
      }),
    );
  });

  it('should not call orderService or commandBus if webhook result has no orderId or paymentStatus', async () => {
    const payload = { action: 'payment.updated' };
    webhookService.processWebhook.mockResolvedValue({
      orderId: null,
      paymentStatus: null,
    } as any);

    await processMercadoPagoWebhookLogic(payload, {
      webhookService,
      orderService,
      commandBus,
    });

    expect(orderService.findOrderByIdAsync).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });
});
