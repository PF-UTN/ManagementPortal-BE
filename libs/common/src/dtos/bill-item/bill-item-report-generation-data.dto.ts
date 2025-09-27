import { Decimal } from '@prisma/client/runtime/library';

export class BillItemReportGenerationDataDto {
  productName: string;
  unitPrice: Decimal;
  quantity: number;
  subtotalPrice: Decimal;
}
