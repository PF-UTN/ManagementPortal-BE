import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

import { MercadoPagoService } from '@mp/common/services';

import { CheckoutOrderQuery } from './checkout-order.query';
import { CheckoutOrderQueryHandler } from './checkout-order.query.handler';
import { DeliveryMethodId } from '../../../../libs/common/src/constants';
import { clientMock } from '../../../../libs/common/src/testing';
import { AuthenticationService } from '../../../domain/service/authentication/authentication.service';
import { ClientService } from '../../../domain/service/client/client.service';
import { OrderService } from '../../../domain/service/order/order.service';

describe('CheckoutOrderQueryHandler', () => {
  let handler: CheckoutOrderQueryHandler;
  let orderService: OrderService;
  let mercadoPagoService: MercadoPagoService;
  let configService: ConfigService;
  let authenticationService: AuthenticationService;
  let clientService: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutOrderQueryHandler,
        {
          provide: OrderService,
          useValue: { findOrderByIdForClientAsync: jest.fn() },
        },
        {
          provide: MercadoPagoService,
          useValue: { createPreference: jest.fn() },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: AuthenticationService,
          useValue: mockDeep<AuthenticationService>(),
        },
        { provide: ClientService, useValue: mockDeep<ClientService>() },
      ],
    }).compile();

    handler = module.get<CheckoutOrderQueryHandler>(CheckoutOrderQueryHandler);
    orderService = module.get<OrderService>(OrderService);
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);
    configService = module.get<ConfigService>(ConfigService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    clientService = module.get<ClientService>(ClientService);
  });

  it('should call MercadoPagoService.createPreference with correct parameters and return checkout', async () => {
    // Arrange
    const query = new CheckoutOrderQuery(1, 'Bearer token');
    const payloadMock = { sub: 5 };

    jest
      .spyOn(authenticationService, 'decodeTokenAsync')
      .mockResolvedValue(payloadMock);
    jest
      .spyOn(clientService, 'findClientByUserIdAsync')
      .mockResolvedValue(clientMock);

    const orderDetailsToClientDtoMock = {
      id: 1,
      client: {
        companyName: 'Test Company',
        user: {
          firstName: 'Juan',
          lastName: 'Perez',
          email: 'juan@mail.com',
          phone: '123456789',
        },
        address: {
          street: 'Calle Falsa',
          streetNumber: 123,
        },
        taxCategory: {
          name: 'Responsable Inscripto',
          description: '',
        },
      },
      deliveryMethodName: 'Delivery',
      deliveryMethodId: DeliveryMethodId.HomeDelivery,
      orderStatus: {
        name: 'Pending',
      },
      paymentDetail: {
        paymentType: {
          name: 'Efectivo',
        },
      },
      orderItems: [
        {
          id: 10,
          productId: 20,
          orderId: 1,
          unitPrice: 100,
          quantity: 2,
          subtotalPrice: 200,
          product: {
            name: 'Product A',
            description: 'Desc',
            imageUrl: 'img.jpg',
            enabled: true,
            weight: 1,
            categoryId: 1,
            supplierId: 1,
            deletedAt: null,
            id: 20,
            price: 100,
            category: { name: 'Electronics' },
          },
        },
      ],
      totalAmount: 100,
      createdAt: new Date(),
    };

    const checkoutResult = mockDeep<PreferenceResponse>({ id: 'pref_123' });
    jest
      .spyOn(orderService, 'findOrderByIdForClientAsync')
      .mockResolvedValueOnce(orderDetailsToClientDtoMock);
    jest.spyOn(configService, 'get').mockReturnValue('http://frontend');
    jest
      .spyOn(mercadoPagoService, 'createPreference')
      .mockResolvedValueOnce(checkoutResult);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(authenticationService.decodeTokenAsync).toHaveBeenCalledWith(
      'token',
    );
    expect(orderService.findOrderByIdForClientAsync).toHaveBeenCalledWith(
      query.orderId,
      payloadMock.sub,
    );
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
        shipments: { cost: 5000, mode: 'not_specified' },
        back_urls: {
          success: 'http://frontend/pedidos/cliente',
          failure: 'http://frontend/pedidos/cliente',
          pending: 'http://frontend/pedidos/cliente',
        },
        auto_return: 'approved',
        notification_url: 'http://frontend',
        external_reference: '1',
      },
    });
    expect(result).toBe(checkoutResult);
  });

  it('should set shipments cost to 0 if DeliveryMethodId.PickUpAtStore', async () => {
    // Arrange
    const query = new CheckoutOrderQuery(1, 'Bearer token');
    const payloadMock = { sub: 5 };

    jest
      .spyOn(authenticationService, 'decodeTokenAsync')
      .mockResolvedValue(payloadMock);
    jest
      .spyOn(clientService, 'findClientByUserIdAsync')
      .mockResolvedValue(clientMock);

    const orderDetailsToClientDtoMock = {
      id: payloadMock.sub,
      client: {
        companyName: 'Test Company',
        user: {
          firstName: 'Juan',
          lastName: 'Perez',
          email: 'juan@mail.com',
          phone: '123456789',
        },
        address: {
          street: 'Calle Falsa',
          streetNumber: 123,
        },
        taxCategory: {
          name: 'Responsable Inscripto',
          description: '',
        },
      },
      deliveryMethodName: 'Delivery',
      deliveryMethodId: DeliveryMethodId.PickUpAtStore,
      orderStatus: {
        name: 'Pending',
      },
      paymentDetail: {
        paymentType: {
          name: 'Efectivo',
        },
      },
      orderItems: [
        {
          id: 10,
          productId: 20,
          orderId: 1,
          unitPrice: 100,
          quantity: 2,
          subtotalPrice: 200,
          product: {
            name: 'Product A',
            description: 'Desc',
            imageUrl: 'img.jpg',
            enabled: true,
            weight: 1,
            categoryId: 1,
            supplierId: 1,
            deletedAt: null,
            id: 20,
            price: 100,
            category: { name: 'Electronics' },
          },
        },
      ],
      totalAmount: 100,
      createdAt: new Date(),
    };

    const checkoutResult = mockDeep<PreferenceResponse>({ id: 'pref_456' });
    jest
      .spyOn(orderService, 'findOrderByIdForClientAsync')
      .mockResolvedValueOnce(orderDetailsToClientDtoMock);
    jest.spyOn(configService, 'get').mockReturnValue('http://frontend');
    jest
      .spyOn(mercadoPagoService, 'createPreference')
      .mockResolvedValueOnce(checkoutResult);

    // Act
    const result = await handler.execute(query);

    // Assert
    expect(authenticationService.decodeTokenAsync).toHaveBeenCalledWith(
      'token',
    );
    expect(orderService.findOrderByIdForClientAsync).toHaveBeenCalledWith(
      query.orderId,
      payloadMock.sub,
    );
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
