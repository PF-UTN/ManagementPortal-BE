import {
  OrderItemDataDto,
  OrderItemDataToClientDto,
} from '../order-item/order-item.data.dto';
import { PaymentDetailDto } from '../payment-detail';

export class OrderDetailsDto {
  id: number;
  client: {
    companyName: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    taxCategory: {
      name: string;
      description: string;
    };
    address: {
      street: string;
      streetNumber: number;
    };
  };
  orderStatus: {
    name: string;
  };
  paymentDetail: PaymentDetailDto;
  totalAmount: number;
  deliveryMethodName: string;
  createdAt: Date;
  orderItems: OrderItemDataDto[];
}

export class OrderDetailsToClientDto {
  id: number;
  client: {
    companyName: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    taxCategory: {
      name: string;
      description: string;
    };
    address: {
      street: string;
      streetNumber: number;
    };
  };
  orderStatus: {
    name: string;
  };
  paymentDetail: PaymentDetailDto;
  totalAmount: number;
  deliveryMethodName: string;
  createdAt: Date;
  orderItems: OrderItemDataToClientDto[];
}
