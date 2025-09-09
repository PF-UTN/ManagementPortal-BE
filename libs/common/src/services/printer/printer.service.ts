import { Inject, Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable()
export class PrinterService {
  constructor(@Inject('PDF_PRINTER') private readonly printer: PdfPrinter) {}

  createPdf(docDefinition: TDocumentDefinitions) {
    return this.printer.createPdfKitDocument(docDefinition);
  }
}
