import { Module } from '@nestjs/common';
import PdfPrinter from 'pdfmake';

import { PrinterService } from './printer.service';
import { Fonts } from '../../../../../assets/files.constants';

export const fonts = {
  Roboto: Fonts.Roboto,
};

@Module({
  imports: [],
  providers: [
    PrinterService,
    {
      provide: 'PDF_PRINTER',
      useFactory: () => new PdfPrinter(fonts),
    },
  ],
  exports: [PrinterService],
})
export class PrinterServiceModule {}
