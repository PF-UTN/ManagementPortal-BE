import { Module } from '@nestjs/common';
import PdfPrinter from 'pdfmake';

import { PrinterService } from './printer.service';

const fonts = {
  Roboto: {
    normal:
      'https://rykocsrdf1gsyk57.public.blob.vercel-storage.com/fonts/Roboto-Regular.ttf',
    bold: 'https://rykocsrdf1gsyk57.public.blob.vercel-storage.com/fonts/Roboto-Medium.ttf',
    italics:
      'https://rykocsrdf1gsyk57.public.blob.vercel-storage.com/fonts/Roboto-Italic.ttf',
    bolditalics:
      'https://rykocsrdf1gsyk57.public.blob.vercel-storage.com/fonts/Roboto-MediumItalic.ttf',
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
