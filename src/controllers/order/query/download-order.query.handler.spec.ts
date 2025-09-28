import { mockDeep } from 'jest-mock-extended';

import { DownloadOrderDto } from '@mp/common/dtos';

import { DownloadOrderQuery } from './download-order.query';
import { DownloadOrderQueryHandler } from './download-order.query.handler';
import { OrderService } from '../../../domain/service/order/order.service';

describe('DownloadOrderQueryHandler', () => {
  let handler: DownloadOrderQueryHandler;
  let orderService: jest.Mocked<OrderService>;

  beforeEach(() => {
    orderService = mockDeep<OrderService>();
    handler = new DownloadOrderQueryHandler(orderService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const query = new DownloadOrderQuery({
      searchText: 'test',
      filters: {
        statusName: ['Pending'],
      },
    });

    it('should call orderService.downloadWithFiltersAsync with the query', async () => {
      const order = {
        id: 1,
        clientId: 1,
        orderStatusId: 1,
        createdAt: new Date('1990-01-01'),
        totalAmount: 200.5,
        paymentDetailId: 1,
        deliveryMethodId: 1,
        client: {
          id: 1,
          companyName: 'Cliente Test',
        },
        orderStatus: {
          name: 'Pending',
        },
      };

      jest
        .spyOn(orderService, 'downloadWithFiltersAsync')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue([order] as any);

      await handler.execute(query);

      expect(orderService.downloadWithFiltersAsync).toHaveBeenCalledWith(query);
    });

    it('should map purchase orders to DownloadOrderDto', async () => {
      const order = {
        id: 1,
        clientId: 1,
        orderStatusId: 1,
        createdAt: new Date('1990-01-01'),
        totalAmount: 200.5,
        paymentDetailId: 1,
        deliveryMethodId: 1,
        client: {
          id: 1,
          companyName: 'Cliente Test',
        },
        orderStatus: {
          name: 'Pending',
        },
      };

      jest
        .spyOn(orderService, 'downloadWithFiltersAsync')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue([order] as any);

      const result = await handler.execute(query);

      const expected: DownloadOrderDto[] = [
        {
          ID: 1,
          Cliente: 'Cliente Test',
          Estado: 'Pendiente',
          Fecha_Creacion: new Date('1990-01-01'),
          Monto_Total: 200.5,
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
