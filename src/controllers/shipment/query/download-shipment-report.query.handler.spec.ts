import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { DownloadShipmentReportDto } from '@mp/common/dtos';

import { DownloadShipmentReportQuery } from './download-shipment-report.query';
import { DownloadShipmentReportQueryHandler } from './download-shipment-report.query.handler';
import { ShipmentService } from '../../../domain/service/shipment/shipment.service';

describe('DownloadShipmentReportQueryHandler', () => {
  let handler: DownloadShipmentReportQueryHandler;
  let shipmentService: ShipmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadShipmentReportQueryHandler,
        {
          provide: ShipmentService,
          useValue: mockDeep(ShipmentService),
        },
      ],
    }).compile();

    shipmentService = module.get<ShipmentService>(ShipmentService);

    handler = module.get<DownloadShipmentReportQueryHandler>(
      DownloadShipmentReportQueryHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const query = new DownloadShipmentReportQuery(1);
    const mockReportResponse: DownloadShipmentReportDto = {
      fileName: 'shipment-1.pdf',
      contentType: 'application/pdf',
      buffer: Buffer.from('fake-pdf-content'),
    };

    it('should call downloadReportAsync on the service', async () => {
      // Arrange
      jest
        .spyOn(shipmentService, 'downloadReportAsync')
        .mockResolvedValueOnce(mockReportResponse);

      const downloadReportAsyncSpy = jest.spyOn(
        shipmentService,
        'downloadReportAsync',
      );

      // Act
      await handler.execute(query);

      // Assert
      expect(downloadReportAsyncSpy).toHaveBeenCalledWith(query.id);
    });

    it('should return the report data correctly', async () => {
      // Arrange
      jest
        .spyOn(shipmentService, 'downloadReportAsync')
        .mockResolvedValueOnce(mockReportResponse);

      // Act
      const response = await handler.execute(query);

      // Assert
      expect(response).toEqual(mockReportResponse);
      expect(response.fileName).toBe('shipment-1.pdf');
      expect(response.contentType).toBe('application/pdf');
      expect(response.buffer).toBeInstanceOf(Buffer);
    });
  });
});
