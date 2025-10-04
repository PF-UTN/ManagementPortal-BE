import { Decimal } from '@prisma/client/runtime/library';

export interface OrderBasicDto {
  id: number;
  clientId: number;
  orderStatusId: number;
  paymentDetailId: number;
  deliveryMethodId: number;
  shipmentId: number | null;
  totalAmount: Decimal;
  createdAt: Date;
}
