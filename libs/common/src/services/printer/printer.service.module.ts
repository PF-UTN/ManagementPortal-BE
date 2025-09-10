import { Module } from '@nestjs/common';
import PdfPrinter from 'pdfmake';

import { PrinterService } from './printer.service';
import { getFonts } from '../../helpers/image/fonts.helper';

@Module({
  imports: [],
  providers: [
    PrinterService,
    {
      provide: 'PDF_PRINTER',
      useFactory: async () => new PdfPrinter(await getFonts()),
    },
  ],
  exports: [PrinterService],
})
export class PrinterServiceModule {}
