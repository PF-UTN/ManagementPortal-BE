import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import PdfPrinter from 'pdfmake';

import { PrinterService } from './printer.service';

describe('PrinterService', () => {
  let service: PrinterService;
  let printer: PdfPrinter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrinterService,
        {
          provide: 'PDF_PRINTER',
          useValue: mockDeep<PdfPrinter>(),
        },
      ],
    }).compile();

    printer = module.get('PDF_PRINTER');
    service = module.get<PrinterService>(PrinterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPdf', () => {
    it('should call createPdfKitDocument with correct docDefinition', () => {
      // Arrange
      const docDefinition = { content: 'Test PDF' };
      const createPdfKitDocumentSpy = jest.spyOn(
        printer,
        'createPdfKitDocument',
      );

      // Act
      service.createPdf(docDefinition);

      // Assert
      expect(createPdfKitDocumentSpy).toHaveBeenCalledWith(docDefinition);
    });
  });
});
