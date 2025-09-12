import { StreamableFile } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';

import { StockChangedField } from '@mp/common/constants';
import {
  CreateManyStockChangeDto,
  DownloadProductRequest,
  SearchProductRequest,
} from '@mp/common/dtos';
import { DateHelper, ExcelExportHelper } from '@mp/common/helpers';
import {
  productCreationDtoMock,
  productCreationDtoWithImageMock,
  productUpdateDtoWithImageMock,
} from '@mp/common/testing';

import { AdjustProductStockCommand } from './command/adjust-product-stock.command';
import { CreateProductCommand } from './command/create-product.command';
import { DeleteProductCommand } from './command/delete-product.command';
import { SearchProductQuery } from './command/search-product-query';
import { UpdateEnabledProductCommand } from './command/update-enabled-product.command';
import { UpdateProductCommand } from './command/update-product.command';
import { ProductController } from './product.controller';
import { DownloadProductQuery } from './query/download-product.query';

describe('ProductController', () => {
  let controller: ProductController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockDeep<QueryBus>(),
        },
        {
          provide: CommandBus,
          useValue: mockDeep<CommandBus>(),
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('searchAsync', () => {
    it('should call execute on the queryBus with correct parameters', async () => {
      const request: SearchProductRequest = {
        searchText: 'test',
        page: 1,
        pageSize: 10,
        filters: {
          categoryName: ['Electronics'],
          supplierBusinessName: ['Supplier A'],
          enabled: true,
        },
      };

      await controller.searchAsync(request);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new SearchProductQuery(request),
      );
    });
  });

  describe('downloadAsync', () => {
    const downloadProductRequest: DownloadProductRequest = {
      searchText: 'test',
      filters: {
        categoryName: ['Electronics'],
        supplierBusinessName: ['Supplier A'],
        enabled: true,
      },
    };

    const products = [{ id: 1, name: 'Product A' }];
    const buffer = Buffer.from('test');
    const expectedFilename = `${DateHelper.formatYYYYMMDD(new Date())} - Listado Productos`;

    beforeEach(() => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(products);
      jest
        .spyOn(ExcelExportHelper, 'exportToExcelBuffer')
        .mockReturnValue(buffer);
    });

    it('should call execute on the queryBus with correct parameters', async () => {
      await controller.downloadAsync(downloadProductRequest);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new DownloadProductQuery(downloadProductRequest),
      );
    });

    it('should call exportToExcelBuffer with products', async () => {
      await controller.downloadAsync(downloadProductRequest);
      expect(ExcelExportHelper.exportToExcelBuffer).toHaveBeenCalledWith(
        products,
      );
    });

    it('should return a StreamableFile', async () => {
      const result = await controller.downloadAsync(downloadProductRequest);
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should set the correct filename in the disposition', async () => {
      const result = await controller.downloadAsync(downloadProductRequest);
      expect(result.options.disposition).toBe(
        `attachment; filename="${expectedFilename}"`,
      );
    });

    it('should set the correct content type', async () => {
      const result = await controller.downloadAsync(downloadProductRequest);
      expect(result.options.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should set the correct length', async () => {
      const result = await controller.downloadAsync(downloadProductRequest);
      expect(result.options.length).toBe(buffer.length);
    });
  });

  describe('createProductAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateProductCommand(productCreationDtoMock);

      // Act
      await controller.createProductAsync(productCreationDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });

    it('should call execute on the commandBus with image file', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new CreateProductCommand(
        productCreationDtoWithImageMock,
      );

      // Act
      await controller.createProductAsync(
        productCreationDtoWithImageMock,
        productCreationDtoWithImageMock.image,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('updateProductAsync', () => {
    it('should call execute on the commandBus with image file', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new UpdateProductCommand(
        1,
        productUpdateDtoWithImageMock,
      );

      // Act
      await controller.updateProductAsync(
        1,
        productUpdateDtoWithImageMock,
        productUpdateDtoWithImageMock.image,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('updateEnabledProductAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const enabled = false;
      const expectedCommand = new UpdateEnabledProductCommand(1, enabled);

      // Act
      await controller.updateEnabledProductAsync(1, { enabled });

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('deleteProductAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new DeleteProductCommand(1);

      // Act
      await controller.deleteProductAsync(1);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('adjustProductStockAsync', () => {
    it('should call execute on the commandBus with correct parameters', async () => {
      // Arrange
      const createManyStockChangeDtoMock: CreateManyStockChangeDto = {
        productId: 1,
        changes: [
          {
            changedField: StockChangedField.QuantityAvailable,
            previousValue: 10,
            newValue: 5,
          },
        ],
        reason: 'Restock after inventory audit',
      };
      const executeSpy = jest.spyOn(commandBus, 'execute');
      const expectedCommand = new AdjustProductStockCommand(
        createManyStockChangeDtoMock,
      );

      // Act
      await controller.adjustProductStockAsync(createManyStockChangeDtoMock);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
