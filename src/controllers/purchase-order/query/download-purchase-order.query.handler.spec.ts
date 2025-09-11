import { Decimal } from '@prisma/client/runtime/library';
import { mockDeep } from 'jest-mock-extended';

import { DownloadPurchaseOrderDto } from '@mp/common/dtos';

import { DownloadPurchaseOrderQuery } from './download-purchase-order.query';
import { DownloadPurchaseOrderQueryHandler } from './download-purchase-order.query.handler';
import { PurchaseOrderService } from '../../../domain/service/purchase-order/purchase-order.service';

describe('DownloadPurchaseOrderQueryHandler', () => {
  let handler: DownloadPurchaseOrderQueryHandler;
  let purchaseOrderService: jest.Mocked<PurchaseOrderService>;

  beforeEach(() => {
    purchaseOrderService = mockDeep<PurchaseOrderService>();
    handler = new DownloadPurchaseOrderQueryHandler(purchaseOrderService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const query = new DownloadPurchaseOrderQuery({
      searchText: 'test',
      filters: {
        supplierBusinessName: ['Proveedor A'],
      },
    });

    const purchaseOrders = [
      {
        id: 1,
        supplier: { id: 1, businessName: 'Proveedor A' },
        purchaseOrderStatus: { id: 1, name: 'Pendiente' },
        createdAt: new Date('2025-09-10'),
        estimatedDeliveryDate: new Date('2025-09-15'),
        effectiveDeliveryDate: null,
        observation: 'Urgente',
        totalAmount: new Decimal(250.5),
        purchaseOrderItems: [
          {
            id: 101,
            product: { name: 'Producto 1' },
            unitPrice: new Decimal(100),
            quantity: 2,
            subtotalPrice: new Decimal(200),
          },
          {
            id: 102,
            product: { name: 'Producto 2' },
            unitPrice: new Decimal(50.25),
            quantity: 1,
            subtotalPrice: new Decimal(50.25),
          },
        ],
      },
    ];

    it('should call purchaseOrderService.downloadWithFiltersAsync with the query', async () => {
      jest
        .spyOn(purchaseOrderService, 'downloadWithFiltersAsync')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(purchaseOrders as any);

      await handler.execute(query);

      expect(
        purchaseOrderService.downloadWithFiltersAsync,
      ).toHaveBeenCalledWith(query);
    });

    it('should map purchase orders to DownloadPurchaseOrderDto', async () => {
      jest
        .spyOn(purchaseOrderService, 'downloadWithFiltersAsync')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(purchaseOrders as any);

      const result = await handler.execute(query);

      const expected: DownloadPurchaseOrderDto[] = [
        {
          ID: 1,
          Estado: 'Pendiente',
          Proveedor: 'Proveedor A',
          Fecha_Creacion: new Date('2025-09-10'),
          Fecha_Entrega_Estimada: new Date('2025-09-15'),
          Fecha_Entrega_Efectiva: null,
          Observacion: 'Urgente',
          Monto_Total: 250.5,
          Productos: JSON.stringify([
            {
              ID: 101,
              Producto: 'Producto 1',
              Precio_Unitario: new Decimal(100),
              Cantidad: 2,
              Subtotal: new Decimal(200),
            },
            {
              ID: 102,
              Producto: 'Producto 2',
              Precio_Unitario: new Decimal(50.25),
              Cantidad: 1,
              Subtotal: new Decimal(50.25),
            },
          ]),
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
