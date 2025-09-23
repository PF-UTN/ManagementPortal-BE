import { Prisma } from '@prisma/client';

import { DeliveryMethodId, OrderStatusId } from '../constants';
import { OrderCreationDto } from '../dtos';

export const orderCreationDtoMock: OrderCreationDto = {
  clientId: 1,
  orderStatusId: OrderStatusId.Pending,
  paymentDetail: {
    paymentTypeId: 1,
  },
  deliveryMethodId: DeliveryMethodId.HomeDelivery,
  orderItems: [
    {
      productId: 1,
      quantity: 10,
      unitPrice: 10.5,
    },
  ],
};

export const orderMock = {
  id: 1,
  clientId: 1,
  orderStatusId: OrderStatusId.Pending,
  deliveryMethodId: DeliveryMethodId.HomeDelivery,
  paymentDetailId: 1,
  totalAmount: new Prisma.Decimal(105.0),
  createdAt: new Date(),
};

export const stockMock = {
  productId: 1,
  quantityAvailable: 5,
  quantityOrdered: 0,
  quantityReserved: 0,
  id: 1,
};

export const mockPaymentDetail = {
  id: 1,
  paymentTypeId: orderCreationDtoMock.paymentDetail.paymentTypeId,
};

export const mockOrderItem = [
  {
    orderId: 1,
    productId: 1,
    quantity: 10,
    unitPrice: 10.5,
    subtotalPrice: 105.0,
  },
];

export const txMock = {} as Prisma.TransactionClient;

export const orderDataMock = {
  clientId: 1,
  orderStatusId: 1,
  deliveryMethodId: DeliveryMethodId.HomeDelivery,
  paymentDetailId: 1,
  totalAmount: 150.75,
};
export const orderFullMock = {
  id: 1,
  clientId: 1,
  client: {
    id: 1,
    userId: 1,
    addressId: 1,
    companyName: 'Test Company',
    taxCategoryId: 1,
  },
  orderStatusId: OrderStatusId.Pending,
  orderStatus: {
    id: OrderStatusId.Pending,
    name: 'Pending',
  },
  paymentDetailId: 1,
  paymentDetail: {
    id: 1,
    paymentTypeId: 1,
    paymentType: {
      id: 1,
      name: 'Efectivo',
      description: 'Pago en efectivo',
    },
    amount: new Prisma.Decimal(105.0),
    paid: true,
  },
  totalAmount: new Prisma.Decimal(105.0),
  deliveryMethodId: DeliveryMethodId.HomeDelivery,
  deliveryMethod: {
    id: DeliveryMethodId.HomeDelivery,
    name: 'Delivery',
    description: 'Entrega a domicilio',
  },
  createdAt: new Date(),
  orderItems: [
    {
      id: 1,
      orderId: 1,
      productId: 1,
      quantity: 10,
      unitPrice: new Prisma.Decimal(10.5),
      subtotalPrice: new Prisma.Decimal(105.0),
      product: {
        id: 1,
        name: 'Producto 1',
        description: 'Descripción producto 1',
      },
    },
  ],
};
