import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';

import { ProcessMercadoPagoWebhookCommand } from './mercadopago-webhook.command';
import { DeliveryMethodNameToIdMap } from '../../../../libs/common/src/constants';
import {
  getOrderStatusFromPaymentAndDeliveryMethod,
  MercadoPagoPaymentStatus,
} from '../../../../libs/common/src/constants/mercado-pago.constants';
import { OrderService } from '../../../domain/service/order/order.service';
import { MercadoPagoWebhookService } from '../../../services/mercadopago-webhook.service';
import { UpdateOrderStatusCommand } from '../../order/command/update-order-status.command';

@CommandHandler(ProcessMercadoPagoWebhookCommand)
export class ProcessMercadoPagoWebhookHandler
  implements ICommandHandler<ProcessMercadoPagoWebhookCommand>
{
  constructor(
    private readonly webhookService: MercadoPagoWebhookService,
    private readonly orderService: OrderService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ProcessMercadoPagoWebhookCommand): Promise<void> {
    if (!command?.payload.action.includes('payment')) {
      return;
    }

    const result = await this.webhookService.processWebhook(command.payload);

    if (result?.orderId && result?.paymentStatus) {
      const order = await this.orderService.findOrderByIdAsync(result.orderId);
      const newOrderStatusId = getOrderStatusFromPaymentAndDeliveryMethod(
        result.paymentStatus as MercadoPagoPaymentStatus,
        DeliveryMethodNameToIdMap[order.deliveryMethodName],
      );

      const updateOrderStatusCommand = new UpdateOrderStatusCommand(
        result.orderId,
        { orderStatusId: newOrderStatusId },
      );
      await this.commandBus.execute(updateOrderStatusCommand);
    }
  }
}
