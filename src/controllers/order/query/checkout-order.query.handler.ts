import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

import { DeliveryMethodId } from '@mp/common/constants';
import { MercadoPagoService } from '@mp/common/services';

import { CheckoutOrderQuery } from './checkout-order.query';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';
import { OrderService } from '../../../domain/service/order/order.service';

@QueryHandler(CheckoutOrderQuery)
export class CheckoutOrderQueryHandler
  implements IQueryHandler<CheckoutOrderQuery>
{
  constructor(
    private readonly orderService: OrderService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(query: CheckoutOrderQuery): Promise<PreferenceResponse> {
    const token = query.authorizationHeader.split(' ')[1];
    const payload = await this.authenticationService.decodeTokenAsync(token);
    const userId = payload.sub;

    const order = await this.orderService.findOrderByIdForClientAsync(
      query.orderId,
      userId,
    );
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const shipments =
      order.deliveryMethodId == DeliveryMethodId.PickUpAtStore
        ? { cost: 0, mode: 'not_specified' }
        : { cost: 3500, mode: 'not_specified' };

    const baseUrl = this.configService.get<string>('FRONTEND_BASE_URL');
    const checkout = await this.mercadoPagoService.createPreference({
      body: {
        items: order.orderItems.map((item) => ({
          id: item.id.toString(),
          title: item.product.name,
          description: item.product.description,
          picture_url: item.product.imageUrl ?? undefined,
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
        shipments,
        back_urls: {
          success: `${baseUrl}/pedidos/checkout/exito`,
          failure: `${baseUrl}/pedidos/checkout/fallo`,
          pending: `${baseUrl}/pedidos/checkout/pendiente`,
        },
        auto_return: 'approved',
        notification_url: this.configService.get<string>('MP_WEBHOOK_URL'),
        external_reference: order.id.toString(),
      },
    });

    return checkout;
  }
}
