import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

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
  shipmentId: null
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

export const orderBigMock = {
  id: 1,
  clientId: 1,
  orderStatusId: OrderStatusId.Pending,
  deliveryMethodId: DeliveryMethodId.HomeDelivery,
  paymentDetailId: 1,
  totalAmount: new Decimal(100),
  createdAt: new Date('2024-07-01T10:00:00Z'),
  orderStatus: { id: OrderStatusId.Pending, name: 'Pending' },
  shipmentId: null,
  orderItems: [
    {
      id: 1,
      orderId: 1,
      productId: 1,
      unitPrice: new Decimal(50),
      quantity: 2,
      subtotalPrice: new Decimal(100),
    },
    {
      id: 2,
      orderId: 1,
      productId: 2,
      unitPrice: new Decimal(25),
      quantity: 1,
      subtotalPrice: new Decimal(25),
    },
  ],
};
