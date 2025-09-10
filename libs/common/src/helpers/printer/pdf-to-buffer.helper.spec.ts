import { join } from 'path';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

import { pdfToBuffer } from './pdf-to-buffer.helper';

describe('pdfToBuffer', () => {
  it('should return a Buffer', async () => {
    // Arrange
    const fonts = {
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
    const printer = new PdfPrinter(fonts);

    const docDefinition: TDocumentDefinitions = {
      content: ['Hello pdfmake'],
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    // Act
    const buffer = await pdfToBuffer(pdfDoc);

    // Assert
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
