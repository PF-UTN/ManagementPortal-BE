import { StreamableFile } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import {
  OrderDirection,
  PurchaseOrderField,
  PurchaseOrderStatusId,
} from '@mp/common/constants';
import {
  DownloadPurchaseOrderRequest,
  PurchaseOrderCreationDto,
  PurchaseOrderDetailsDto,
  PurchaseOrderUpdateDto,
  SearchPurchaseOrderRequest,
  UpdatePurchaseOrderStatusRequestDto,
} from '@mp/common/dtos';
import { DateHelper, ExcelExportHelper } from '@mp/common/helpers';

import { CreatePurchaseOrderCommand } from './command/create-purchase-order.command';
import { DeletePurchaseOrderCommand } from './command/delete-purchase-order.command';
import { UpdatePurchaseOrderStatusCommand } from './command/update-purchase-order-status.command';
import { UpdatePurchaseOrderCommand } from './command/update-purchase-order.command';
import { PurchaseOrderController } from './purchase-order.controller';
import { DownloadPurchaseOrderQuery } from './query/download-purchase-order.query';
import { GetPurchaseOrderByIdQuery } from './query/get-purchase-order-by-id.query';
import { SearchPurchaseOrderQuery } from './query/search-purchase-order.query';

describe('PurchaseOrderController', () => {
  let controller: PurchaseOrderController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrderController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep(QueryBus),
        },
        {
          provide: CommandBus,
          useValue: mockDeep(CommandBus),
        },
        {
          provide: QueryBus,
          useValue: mockDeep(QueryBus),
        },
      ],
    }).compile();

    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    controller = module.get<PurchaseOrderController>(PurchaseOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('searchPurchaseOrdersAsync', () => {
    it('should call queryBus.execute with SearchPurchaseOrderQuery and correct params', async () => {
      // Arrange
      const request: SearchPurchaseOrderRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: {
          statusName: ['Ordered'],
          supplierBusinessName: ['Supplier A'],
          fromDate: '2025-01-01',
          toDate: '2025-12-31',
          fromEstimatedDeliveryDate: '2025-01-15',
          toEstimatedDeliveryDate: '2025-01-20',
        },
        orderBy: {
          field: PurchaseOrderField.CREATED_AT,
          direction: OrderDirection.ASC,
        },
      };
      // Act
      await controller.searchPurchaseOrdersAsync(request);
      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchPurchaseOrderQuery(request),
      );
    });
  });

  describe('PurchaseOrderController - downloadPurchaseOrdersAsync', () => {
    const downloadPurchaseOrderRequest: DownloadPurchaseOrderRequest = {
      searchText: 'test',
      filters: {
        supplierBusinessName: ['Proveedor A'],
      },
    };

    const buffer = Buffer.from('test');
    const expectedFilename = `${DateHelper.formatYYYYMMDD(
      new Date(),
    )} - Listado Ordenes de Compra`;

    beforeEach(async () => {
      jest
        .spyOn(ExcelExportHelper, 'exportToExcelBuffer')
        .mockReturnValue(buffer);
    });

    it('should call queryBus.execute with DownloadPurchaseOrderQuery', async () => {
      await controller.downloadPurchaseOrdersAsync(
        downloadPurchaseOrderRequest,
      );
      expect(queryBus.execute).toHaveBeenCalledWith(
        new DownloadPurchaseOrderQuery(downloadPurchaseOrderRequest),
      );
    });

    it('should call ExcelExportHelper.exportToExcelBuffer with purchase orders', async () => {
      await controller.downloadPurchaseOrdersAsync(
        downloadPurchaseOrderRequest,
      );
      expect(ExcelExportHelper.exportToExcelBuffer).toHaveBeenCalled();
    });

    it('should return a StreamableFile', async () => {
      const result = await controller.downloadPurchaseOrdersAsync(
        downloadPurchaseOrderRequest,
      );
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should set the correct filename in the disposition', async () => {
      const result = await controller.downloadPurchaseOrdersAsync(
        downloadPurchaseOrderRequest,
      );
      expect(result.options.disposition).toBe(
        `attachment; filename="${expectedFilename}"`,
      );
    });

    it('should set the correct content type', async () => {
      const result = await controller.downloadPurchaseOrdersAsync(
        downloadPurchaseOrderRequest,
      );
      expect(result.options.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should set the correct length', async () => {
      const result = await controller.downloadPurchaseOrdersAsync(
        downloadPurchaseOrderRequest,
      );
      expect(result.options.length).toBe(buffer.length);
    });
  });

  describe('createPurchaseOrderAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const purchaseOrderCreationDtoMock: PurchaseOrderCreationDto = {
        supplierId: 1,
        estimatedDeliveryDate: new Date('1990-01-15'),
        observation: 'Purchase order for office supplies',
        purchaseOrderStatusId: PurchaseOrderStatusId.Ordered,
        purchaseOrderItems: [
          {
            productId: 1,
            quantity: 10,
            unitPrice: 100,
          },
        ],
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreatePurchaseOrderCommand(
        purchaseOrderCreationDtoMock,
      );

      // Act
      await controller.createPurchaseOrderAsync(purchaseOrderCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('getPurchaseOrderByIdAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      // Arrange
      const purchaseOrderDetailsDtoMock: PurchaseOrderDetailsDto = {
        id: 1,
        createdAt: new Date(),
        estimatedDeliveryDate: new Date('1990-01-15'),
        effectiveDeliveryDate: null,
        observation: 'Test observation',
        totalAmount: 100.0,
        status: {
          id: PurchaseOrderStatusId.Ordered,
          name: 'Ordenada',
        },
        supplier: {
          id: 1,
          businessName: 'Test Supplier',
        },
        purchaseOrderItems: [
          {
            id: 1,
            productId: 1,
            productName: 'Test PurchaseOrder',
            unitPrice: 10.0,
            quantity: 10,
            subtotalPrice: 100.0,
          },
        ],
      };
      const executeSpy = jest.spyOn(queryBus, 'execute');
      const expectedQuery = new GetPurchaseOrderByIdQuery(
        purchaseOrderDetailsDtoMock.id,
      );

      // Act
      await controller.getPurchaseOrderByIdAsync(
        purchaseOrderDetailsDtoMock.id,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('deletePurchaseOrderAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new DeletePurchaseOrderCommand(1);

      // Act
      await controller.deletePurchaseOrderAsync(1);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('updatePurchaseOrderAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const id = 1;
      const purchaseOrderUpdateDtoMock: PurchaseOrderUpdateDto = {
        estimatedDeliveryDate: new Date('1990-01-15'),
        effectiveDeliveryDate: new Date('1990-01-20'),
        observation: 'Purchase order for office supplies',
        purchaseOrderStatusId: PurchaseOrderStatusId.Ordered,
        purchaseOrderItems: [
          {
            productId: 1,
            quantity: 10,
            unitPrice: 100,
          },
        ],
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new UpdatePurchaseOrderCommand(
        id,
        purchaseOrderUpdateDtoMock,
      );

      // Act
      await controller.updatePurchaseOrderAsync(id, purchaseOrderUpdateDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('updatePurchaseOrderStatusAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const id = 1;
      const updatePurchaseOrderStatusDto = {
        observation: 'Order cancelled due to supplier delay',
      } as UpdatePurchaseOrderStatusRequestDto;
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new UpdatePurchaseOrderStatusCommand(
        id,
        updatePurchaseOrderStatusDto,
      );

      // Act
      await controller.updatePurchaseOrderStatusAsync(
        id,
        updatePurchaseOrderStatusDto,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
