import { Decimal } from '@prisma/client/runtime/library';

export class BillDataDto {
  beforeTaxPrice: Decimal;
  totalPrice: Decimal;
  orderId: number;
}
