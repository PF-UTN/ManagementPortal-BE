import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

import { MercadoPagoService } from '@mp/common/services';

import { CheckoutOrderQuery } from './checkout-order.query';
import { OrderService } from '../../../domain/service/order/order.service';

@QueryHandler(CheckoutOrderQuery)
export class CheckoutOrderQueryHandler
  implements IQueryHandler<CheckoutOrderQuery>
{
  constructor(
    private readonly orderService: OrderService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
  ) {}

  async execute(query: CheckoutOrderQuery): Promise<PreferenceResponse> {
    const order = await this.orderService.getOrderByIdAsync(query.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const shipments =
      query.shipmentMethodId == 0
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
          unit_price: item.product.price.toNumber(),
        })),
        shipments,
        back_urls: {
          success: `${baseUrl}/pedidos/checkout/exito`,
          failure: `${baseUrl}/pedidos/checkout/fallo`,
          pending: `${baseUrl}/pedidos/checkout/pendiente`,
        },
        auto_return: 'approved',
      },
    });

    return checkout;
  }
}
