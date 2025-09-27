import { Decimal } from '@prisma/client/runtime/library';

export class BillItemDataDto {
  subTotalPrice: Decimal;
  billId: number;
}
