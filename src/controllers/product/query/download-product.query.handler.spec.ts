import { Decimal } from '@prisma/client/runtime/library';
import { mockDeep } from 'jest-mock-extended';

import { OrderDirection, ProductOrderField } from '@mp/common/constants';
import { DownloadProductItemDto } from '@mp/common/dtos';

import { DownloadProductQuery } from './download-product.query';
import { DownloadProductQueryHandler } from './download-product.query.handler';
import { ProductService } from '../../../domain/service/product/product.service';

describe('DownloadProductQueryHandler', () => {
  let handler: DownloadProductQueryHandler;
  let productDomainService: jest.Mocked<ProductService>;

  beforeEach(() => {
    productDomainService = mockDeep<ProductService>();
    handler = new DownloadProductQueryHandler(productDomainService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const query = new DownloadProductQuery({
      searchText: 'test',
      filters: {
        categoryName: ['Electronics'],
        supplierBusinessName: ['Supplier A'],
        enabled: true,
      },
      orderBy: {
        direction: OrderDirection.ASC,
        field: ProductOrderField.NAME,
      },
    });

    const products = [
      {
        id: 1,
        name: 'Product 1',
        description: 'Description for Product 1',
        price: new Decimal(19.99),
        weight: new Decimal(1.5),
        enabled: true,
        stock: {
          quantityAvailable: 50,
          quantityReserved: 10,
          quantityOrdered: 5,
        },
        categoryId: 1,
        supplierId: 1,
        category: {
          name: 'Category 1',
          description: 'Category description',
        },
        supplier: {
          businessName: 'Supplier 1',
        },
        deletedAt: null,
      },
      {
        id: 2,
        name: 'Product 2',
        description: 'Description for Product 2',
        price: new Decimal(29.99),
        weight: new Decimal(2.0),
        enabled: false,
        stock: null,
        categoryId: 2,
        supplierId: 2,
        category: {
          name: 'Category 2',
          description: 'Other category',
        },
        supplier: {
          businessName: 'Supplier 2',
        },
        deletedAt: null,
      },
    ];

    it('should call productDomainService with correct parameters', async () => {
      // Arrange
      jest
        .spyOn(productDomainService, 'downloadWithFiltersAsync')
        .mockResolvedValue(products);

      // Act
      await handler.execute(query);

      // Assert
      expect(
        productDomainService.downloadWithFiltersAsync,
      ).toHaveBeenCalledWith(query.searchText, query.filters, query.orderBy);
    });

    it('should map products to DownloadProductItemDto', async () => {
      // Arrange
      jest
        .spyOn(productDomainService, 'downloadWithFiltersAsync')
        .mockResolvedValue(products);

      // Act
      const result = await handler.execute(query);

      // Assert
      const expected: DownloadProductItemDto[] = [
        {
          ID: 1,
          Nombre: 'Product 1',
          Categoria: 'Category 1',
          Precio: 19.99,
          Cantidad_Disponible: 50,
          Cantidad_Pedida: 5,
          Cantidad_Reservada: 10,
          Estado: 'Activo',
        },
        {
          ID: 2,
          Nombre: 'Product 2',
          Categoria: 'Category 2',
          Precio: 29.99,
          Cantidad_Disponible: 0,
          Cantidad_Pedida: 0,
          Cantidad_Reservada: 0,
          Estado: 'Inactivo',
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
