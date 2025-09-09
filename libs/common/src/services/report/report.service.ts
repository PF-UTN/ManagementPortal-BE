import { Injectable } from '@nestjs/common';

import { PurchaseOrderReportGenerationDataDto } from '@mp/common/dtos';

import { PrinterService } from '../printer/printer.service';
import { purchaseOrderReport } from './document/purchase-order.report';

@Injectable()
export class ReportService {
  constructor(private readonly printer: PrinterService) {}

  async generatePurchaseOrderReport(
    purchaseOrder: PurchaseOrderReportGenerationDataDto,
  ): Promise<PDFKit.PDFDocument> {
    const docDefinition = purchaseOrderReport(purchaseOrder);

    return this.printer.createPdf(docDefinition);
  }
}
