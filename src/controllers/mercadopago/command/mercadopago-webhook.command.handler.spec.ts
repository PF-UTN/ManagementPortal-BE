/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandBus } from '@nestjs/cqrs';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { ProcessMercadoPagoWebhookCommand } from './mercadopago-webhook.command';
import { ProcessMercadoPagoWebhookHandler } from './mercadopago-webhook.command.handler';
import { DeliveryMethodNameToIdMap } from '../../../../libs/common/src/constants';
import {
  getOrderStatusFromPaymentAndDeliveryMethod,
  MercadoPagoPaymentStatus,
} from '../../../../libs/common/src/constants/mercado-pago.constants';
import { OrderService } from '../../../domain/service/order/order.service';
import { MercadoPagoWebhookService } from '../../../services/mercadopago-webhook.service';
import { UpdateOrderStatusCommand } from '../../order/command/update-order-status.command';

describe(ProcessMercadoPagoWebhookHandler.name, () => {
  let handler: ProcessMercadoPagoWebhookHandler;
  let webhookService: DeepMockProxy<MercadoPagoWebhookService>;
  let orderService: DeepMockProxy<OrderService>;
  let commandBus: DeepMockProxy<CommandBus>;

  beforeEach(() => {
    webhookService = mockDeep<MercadoPagoWebhookService>();
    orderService = mockDeep<OrderService>();
    commandBus = mockDeep<CommandBus>();

    handler = new ProcessMercadoPagoWebhookHandler(
      webhookService,
      orderService,
      commandBus,
    );
  });

  describe('execute', () => {
    it('should return early if action does not include payment', async () => {
      // Arrange
      const command = new ProcessMercadoPagoWebhookCommand({
        action: 'test_action',
      } as any);

      // Act
      await handler.execute(command);

      // Assert
      expect(webhookService.processWebhook).not.toHaveBeenCalled();
      expect(orderService.findOrderByIdAsync).not.toHaveBeenCalled();
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('should process webhook and update order status when valid payment webhook', async () => {
      // Arrange
      const mockOrderId = 123;
      const mockPaymentStatus = MercadoPagoPaymentStatus.Approved;
      const mockDeliveryMethod = 'HOME_DELIVERY';

      const command = new ProcessMercadoPagoWebhookCommand({
        action: 'payment.created',
      } as any);

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

      // Act
      await handler.execute(command);

      // Assert
      expect(webhookService.processWebhook).toHaveBeenCalledWith(
        command.payload,
      );
      expect(orderService.findOrderByIdAsync).toHaveBeenCalledWith(mockOrderId);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateOrderStatusCommand(mockOrderId, {
          orderStatusId: expectedOrderStatusId,
        }),
      );
    });

    it('should not call orderService or commandBus if webhook result has no orderId or paymentStatus', async () => {
      // Arrange
      const command = new ProcessMercadoPagoWebhookCommand({
        action: 'payment.updated',
      } as any);

      webhookService.processWebhook.mockResolvedValue({
        orderId: null,
        paymentStatus: null,
      } as any);

      // Act
      await handler.execute(command);

      // Assert
      expect(orderService.findOrderByIdAsync).not.toHaveBeenCalled();
      expect(commandBus.execute).not.toHaveBeenCalled();
    });
  });
});
