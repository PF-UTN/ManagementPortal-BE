import { Decimal } from '@prisma/client/runtime/library';

import { BillItemReportGenerationDataDto } from '../bill-item';

export class BillReportGenerationDataDto {
  billId: number;
  orderId: number;
  createdAt: Date;
  clientCompanyName: string;
  clientAddress: string;
  clientTaxCategory: string;
  clientDocumentType: string;
  clientDocumentNumber: string;
  deliveryMethod: string;
  totalAmount: Decimal;
  orderItems: BillItemReportGenerationDataDto[];
  paymentType: string;
  observation?: string;
}
