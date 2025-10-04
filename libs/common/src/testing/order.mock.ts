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
  shipmentId: null,
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

export const orderItemMock = {
  id: 1,
  productId: 1,
  orderId: 1,
  product: {
    id: 1,
    name: 'Producto 1',
    description: 'Descripción producto 1',
    price: 100,
    enabled: true,
    weight: 2.5,
    category: {
      name: 'Categoría A',
    },
    stock: {
      id: 1,
      quantityAvailable: 50,
      quantityOrdered: 10,
      quantityReserved: 5,
    },
    supplier: {
      id: 1,
      businessName: 'Proveedor S.A.',
      email: 'proveedor@mail.com',
      phone: '123456789',
    },
  },
  unitPrice: new Decimal(100),
  quantity: 2,
  subtotalPrice: new Decimal(200),
};
export const orderFullMock = {
  id: 1,
  clientId: 1,
  shipmentId: 1,
  client: {
    id: 1,
    companyName: 'Test Company',
    userId: 1,
    taxCategoryId: 1,
    addressId: 1,
    user: {
      id: 1,
      firstName: 'Juan',
      lastName: 'Perez',
      email: 'juan@mail.com',
      password: 'hashed',
      phone: '123456789',
      documentType: 'DNI',
      documentNumber: '12345678',
      birthdate: new Date('1990-01-01'),
      roleId: 2,
      accountLockedUntil: null,
      failedLoginAttempts: 0,
    },
    taxCategory: {
      id: 1,
      name: 'Responsable Inscripto',
      description: null,
    },
    address: {
      id: 1,
      townId: 1,
      street: 'Calle Falsa',
      streetNumber: 123,
    },
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
  orderItems: [orderItemMock],
};

export const orderBasicDtoMock = {
  id: 1,
  clientId: 1,
  orderStatusId: 1,
  paymentDetailId: 1,
  deliveryMethodId: 1,
  shipmentId: null,
  totalAmount: new Decimal(1000),
  createdAt: new Date(),
};
