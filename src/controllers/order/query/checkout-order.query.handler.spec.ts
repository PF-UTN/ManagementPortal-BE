import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Product } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

import { MercadoPagoService } from '@mp/common/services';

import { CheckoutOrderQuery } from './checkout-order.query';
import { CheckoutOrderQueryHandler } from './checkout-order.query.handler';
import { OrderService } from '../../../domain/service/order/order.service';

describe('CheckoutOrderQueryHandler', () => {
  let handler: CheckoutOrderQueryHandler;
  let orderService: OrderService;
  let mercadoPagoService: MercadoPagoService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutOrderQueryHandler,
        { provide: OrderService, useValue: { getOrderByIdAsync: jest.fn() } },
        {
          provide: MercadoPagoService,
          useValue: { createPreference: jest.fn() },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    handler = module.get<CheckoutOrderQueryHandler>(CheckoutOrderQueryHandler);
    orderService = module.get<OrderService>(OrderService);
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should throw NotFoundException if order is not found', async () => {
    // Arrange
    const query = new CheckoutOrderQuery(1, 2);
    jest.spyOn(orderService, 'getOrderByIdAsync').mockResolvedValueOnce(null);

    // Act & Assert
    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('should call MercadoPagoService.createPreference with correct parameters and return checkout', async () => {
    // Arrange
    const query = new CheckoutOrderQuery(1, 2);
    const order = mockDeep<
      Prisma.OrderGetPayload<{
        include: { orderItems: { include: { product: true } } };
      }>
    >();

    const priceMock = mockDeep<Prisma.Decimal>();
    priceMock.toNumber.mockReturnValue(100);

    const unitPriceMock = mockDeep<Prisma.Decimal>();
    unitPriceMock.toNumber.mockReturnValue(100);

    order.orderItems = [
      {
        id: 10,
        productId: 20,
        orderId: 1,
        unitPrice: unitPriceMock,
        quantity: 2,
        subtotalPrice: mockDeep<Prisma.Decimal>(),
        product: mockDeep<Product>({
          name: 'Product A',
          description: 'Desc',
          imageUrl: 'img.jpg',
          enabled: true,
          weight: mockDeep<Prisma.Decimal>(),
          categoryId: 1,
          supplierId: 1,
          deletedAt: null,
          id: 20,
        }),
      },
    ];
    order.orderItems[0].product.price = priceMock;

    const checkoutResult = mockDeep<PreferenceResponse>({ id: 'pref_123' });
    jest.spyOn(orderService, 'getOrderByIdAsync').mockResolvedValueOnce(order);
    jest.spyOn(configService, 'get').mockReturnValue('http://frontend');
    jest
      .spyOn(mercadoPagoService, 'createPreference')
      .mockResolvedValueOnce(checkoutResult);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(orderService.getOrderByIdAsync).toHaveBeenCalledWith(query.orderId);
    expect(mercadoPagoService.createPreference).toHaveBeenCalledWith({
      body: {
        items: [
          {
            id: '10',
            title: 'Product A',
            description: 'Desc',
            picture_url: 'img.jpg',
            quantity: 2,
            unit_price: 100,
          },
        ],
        shipments: { cost: 3500, mode: 'not_specified' },
        back_urls: {
          success: 'http://frontend/pedidos/checkout/exito',
          failure: 'http://frontend/pedidos/checkout/fallo',
          pending: 'http://frontend/pedidos/checkout/pendiente',
        },
        auto_return: 'approved',
      },
    });
    expect(result).toBe(checkoutResult);
  });

  it('should set shipments cost to 0 if shipmentMethodId is 0', async () => {
    // Arrange
    const query = new CheckoutOrderQuery(1, 0);
    const order = mockDeep<
      Prisma.OrderGetPayload<{
        include: { orderItems: { include: { product: true } } };
      }>
    >();

    const priceMock = mockDeep<Prisma.Decimal>();
    priceMock.toNumber.mockReturnValue(50);

    order.orderItems = [
      {
        id: 11,
        productId: 22,
        orderId: 1,
        unitPrice: mockDeep<Prisma.Decimal>(),
        quantity: 1,
        subtotalPrice: mockDeep<Prisma.Decimal>(),
        product: mockDeep<Product>({
          name: 'Product B',
          description: 'Desc B',
          imageUrl: null,
          enabled: true,
          weight: mockDeep<Prisma.Decimal>(),
          categoryId: 1,
          supplierId: 1,
          deletedAt: null,
          id: 22,
        }),
      },
    ];
    order.orderItems[0].product.price = priceMock;

    const checkoutResult = mockDeep<PreferenceResponse>({ id: 'pref_456' });
    jest.spyOn(orderService, 'getOrderByIdAsync').mockResolvedValueOnce(order);
    jest.spyOn(configService, 'get').mockReturnValue('http://frontend');
    jest
      .spyOn(mercadoPagoService, 'createPreference')
      .mockResolvedValueOnce(checkoutResult);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(mercadoPagoService.createPreference).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          shipments: { cost: 0, mode: 'not_specified' },
        }),
      }),
    );
    expect(result).toBe(checkoutResult);
  });
});
