import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { PurchaseOrderReportGenerationDataDto } from '@mp/common/dtos';

import { ReportService } from './report.service';
import { PrinterService } from '../printer/printer.service';
import { purchaseOrderReport } from './document/purchase-order.report';

jest.mock('./document/purchase-order.report', () => ({
  purchaseOrderReport: jest.fn(),
}));

describe('ReportService', () => {
  let service: ReportService;
  let printerService: PrinterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: PrinterService,
          useValue: mockDeep<PrinterService>(),
        },
      ],
    }).compile();

    printerService = module.get<PrinterService>(PrinterService);
    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePurchaseOrderReport', () => {
    it('should call purchaseOrderReport with correct arguments', async () => {
      // Arrange
      const purchaseOrderDto = {} as PurchaseOrderReportGenerationDataDto;
      const docDefinition = { some: 'definition' };
      const pdfDoc = { pdf: 'doc' };

      (purchaseOrderReport as jest.Mock).mockReturnValue(docDefinition);
      (printerService.createPdf as jest.Mock).mockResolvedValue(pdfDoc);

      // Act
      await service.generatePurchaseOrderReport(purchaseOrderDto);

      // Assert
      expect(purchaseOrderReport).toHaveBeenCalledWith(purchaseOrderDto);
    });

    it('should call and printer.createPdf with correct arguments', async () => {
      // Arrange
      const purchaseOrderDto = {} as PurchaseOrderReportGenerationDataDto;
      const docDefinition = { some: 'definition' };
      const pdfDoc = { pdf: 'doc' };

      (purchaseOrderReport as jest.Mock).mockReturnValue(docDefinition);
      (printerService.createPdf as jest.Mock).mockResolvedValue(pdfDoc);

      // Act
      await service.generatePurchaseOrderReport(purchaseOrderDto);

      // Assert
      expect(printerService.createPdf).toHaveBeenCalledWith(docDefinition);
    });
  });
});
