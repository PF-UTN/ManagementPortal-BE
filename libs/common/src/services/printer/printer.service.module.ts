import { Module } from '@nestjs/common';
import { join } from 'path';
import PdfPrinter from 'pdfmake';

import { PrinterService } from './printer.service';

export const fonts = {
  Roboto: {
    normal: join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf'),
    bold: join(process.cwd(), 'public', 'fonts', 'Roboto-Medium.ttf'),
    italics: join(process.cwd(), 'public', 'fonts', 'Roboto-Italic.ttf'),
    bolditalics: join(
      process.cwd(),
      'public',
      'fonts',
      'Roboto-MediumItalic.ttf',
    ),
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
