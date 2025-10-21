/* eslint-disable @typescript-eslint/no-explicit-any */
import { OrderDetailsDto } from '@mp/common/dtos';

export function mapOrderToOrderDetailsDto(order: any): OrderDetailsDto {
  return {
    id: order.id,
    client: {
      companyName: order.client?.companyName,
      user: {
        firstName: order.client?.user?.firstName,
        lastName: order.client?.user?.lastName,
        email: order.client?.user?.email,
        phone: order.client?.user?.phone,
      },
      taxCategory: {
        name: order.client?.taxCategory?.name,
        description: order.client?.taxCategory?.description,
      },
      address: {
        street: order.client?.address?.street,
        streetNumber: order.client?.address?.streetNumber,
      },
    },
    orderStatus: {
      name: order.orderStatus?.name,
    },
    paymentDetail: order.paymentDetail,
    totalAmount: order.totalAmount,
    deliveryMethodName: order.deliveryMethod?.name,
    createdAt: order.createdAt,
    orderItems: order.orderItems.map((item: any) => ({
      productId: item.productId,
      productName: item.product?.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotalPrice: item.subtotalPrice,
    })),
  };
}
