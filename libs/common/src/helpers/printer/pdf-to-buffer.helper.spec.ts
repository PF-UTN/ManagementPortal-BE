import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

import { pdfToBuffer } from './pdf-to-buffer.helper';
import { PdfAssets } from '../../../../../assets/pdf-assets.service';

describe('pdfToBuffer', () => {
  it('should return a Buffer', async () => {
    // Arrange
    const fonts = {
      ...PdfAssets.fonts,
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
