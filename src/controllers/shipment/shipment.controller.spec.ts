import { StreamableFile } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Shipment } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { OrderStatusId } from '@mp/common/constants';
import {
  DownloadShipmentRequest,
  FinishShipmentDto,
  SearchShipmentRequest,
  ShipmentCreationDto,
} from '@mp/common/dtos';
import { DateHelper, ExcelExportHelper } from '@mp/common/helpers';

import { CreateShipmentCommand } from './command/create-shipment.command';
import { FinishShipmentCommand } from './command/finish-shipment.command';
import { SendShipmentCommand } from './command/send-shipment.command';
import { DownloadShipmentQuery } from './query/download-shipment.query';
import { GetShipmentByIdQuery } from './query/get-shipment-by-id.query';
import { SearchShipmentQuery } from './query/search-shipment.query';
import { ShipmentController } from './shipment.controller';

describe('ShipmentController', () => {
  let controller: ShipmentController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;
  let shipment: ReturnType<typeof mockDeep<Shipment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep(QueryBus),
        },
        {
          provide: CommandBus,
          useValue: mockDeep(CommandBus),
        },
      ],
    }).compile();

    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);

    controller = module.get<ShipmentController>(ShipmentController);

    shipment = mockDeep<Shipment>();

    shipment.id = 1;
    shipment.date = mockDeep<Date>(new Date('2025-01-15'));
    shipment.vehicleId = 1;
    shipment.statusId = 1;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createShipmentAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const shipmentCreationDtoMock: ShipmentCreationDto = {
        date: shipment.date,
        vehicleId: shipment.vehicleId,
        orderIds: [1, 2, 3],
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateShipmentCommand(
        shipmentCreationDtoMock,
      );

      // Act
      await controller.createShipmentAsync(shipmentCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('sendShipmentAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new SendShipmentCommand(shipmentId);

      // Act
      await controller.sendShipmentAsync(shipmentId);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('finishShipmentAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const shipmentId = shipment.id;
      const finishShipmentDtoMock: FinishShipmentDto = {
        finishedAt: mockDeep<Date>(new Date('2025-01-15 11:35:36')),
        odometer: 125000,
        orders: [
          {
            orderId: 1,
            orderStatusId: OrderStatusId.Finished,
          },
          {
            orderId: 2,
            orderStatusId: OrderStatusId.Prepared,
          },
        ],
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new FinishShipmentCommand(
        shipmentId,
        finishShipmentDtoMock,
      );

      // Act
      await controller.finishShipmentAsync(shipmentId, finishShipmentDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('getShipmentByIdAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const shipmentId = 1;
      const executeSpy = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValue('result');
      const expectedQuery = new GetShipmentByIdQuery(shipmentId);

      // Act
      await controller.getShipmentByIdAsync(shipmentId);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('searcShipmentAsync', () => {
    it('should call queryBus.execute with SearchShipmentQuery and correct params', async () => {
      // Arrange
      const request: SearchShipmentRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: {
          statusName: ['Pending'],
          fromDate: '2025-01-01',
          toDate: '2025-12-31',
        },
      };
      // Act
      await controller.searchShipmentsAsync(request);
      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchShipmentQuery(request),
      );
    });
  });

  describe('downloadShipmentsAsync', () => {
    const downloadShipmentRequest: DownloadShipmentRequest = {
      searchText: 'test',
      filters: {
        statusName: ['Pending'],
      },
    };

    const buffer = Buffer.from('test');
    const expectedFilename = `${DateHelper.formatYYYYMMDD(
      new Date(),
    )} - Listado Envios`;

    beforeEach(async () => {
      jest
        .spyOn(ExcelExportHelper, 'exportToExcelBuffer')
        .mockReturnValue(buffer);
    });

    it('should call queryBus.execute with DownloadShipmentQuery', async () => {
      await controller.downloadShipmentsAsync(downloadShipmentRequest);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new DownloadShipmentQuery(downloadShipmentRequest),
      );
    });

    it('should call ExcelExportHelper.exportToExcelBuffer with shipments', async () => {
      await controller.downloadShipmentsAsync(downloadShipmentRequest);
      expect(ExcelExportHelper.exportToExcelBuffer).toHaveBeenCalled();
    });

    it('should return a StreamableFile', async () => {
      const result = await controller.downloadShipmentsAsync(
        downloadShipmentRequest,
      );
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should set the correct filename in the disposition', async () => {
      const result = await controller.downloadShipmentsAsync(
        downloadShipmentRequest,
      );
      expect(result.options.disposition).toBe(
        `attachment; filename="${expectedFilename}"`,
      );
    });

    it('should set the correct content type', async () => {
      const result = await controller.downloadShipmentsAsync(
        downloadShipmentRequest,
      );
      expect(result.options.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should set the correct length', async () => {
      const result = await controller.downloadShipmentsAsync(
        downloadShipmentRequest,
      );
      expect(result.options.length).toBe(buffer.length);
    });
  });
});
