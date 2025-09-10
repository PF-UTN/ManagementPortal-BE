import { Module } from '@nestjs/common';
import PdfPrinter from 'pdfmake';

import { PrinterService } from './printer.service';

const fonts = {
  Roboto: {
    normal: 'libs/common/src/public/fonts/Roboto-Regular.ttf',
    bold: 'libs/common/src/public/fonts/Roboto-Medium.ttf',
    italics: 'libs/common/src/public/fonts/Roboto-Italic.ttf',
    bolditalics: 'libs/common/src/public/fonts/Roboto-MediumItalic.ttf',
  },
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
