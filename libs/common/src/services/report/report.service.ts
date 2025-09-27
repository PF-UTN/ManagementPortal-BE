import { Injectable } from '@nestjs/common';

import {
  BillReportGenerationDataDto,
  PurchaseOrderReportGenerationDataDto,
} from '@mp/common/dtos';

import { PrinterService } from '../printer/printer.service';
import { billReport } from './document/bill.report';
import { purchaseOrderReport } from './document/purchase-order.report';

@Injectable()
export class ReportService {
  constructor(private readonly printer: PrinterService) {}

  async generatePurchaseOrderReport(
    purchaseOrder: PurchaseOrderReportGenerationDataDto,
  ): Promise<PDFKit.PDFDocument> {
    const docDefinition = await purchaseOrderReport(purchaseOrder);

    return this.printer.createPdf(docDefinition);
  }

  async generateBillReport(
    bill: BillReportGenerationDataDto,
  ): Promise<PDFKit.PDFDocument> {
    const docDefinition = await billReport(bill);

    return this.printer.createPdf(docDefinition);
  }
}
