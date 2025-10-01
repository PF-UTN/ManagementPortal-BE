import { Test, TestingModule } from '@nestjs/testing';

import { MercadoPagoWebhookService } from './mercadopago-webhook.service';
import { MercadoPagoPaymentStatus } from '../../libs/common/src/constants/mercado-pago.constants';
import { MercadoPagoWebhookRequest } from '../../libs/common/src/dtos/mercado-pago/mercadopago-request.dto';
import { MercadoPagoService } from '../../libs/common/src/services';
import { PrismaService } from '../../libs/repository/src';

describe('MercadoPagoWebhookService', () => {
  let service: MercadoPagoWebhookService;
  let prisma: PrismaService;
  let mpService: MercadoPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoWebhookService,
        {
          provide: PrismaService,
          useValue: { payment: { upsert: jest.fn() } },
        },
        {
          provide: MercadoPagoService,
          useValue: { getPaymentDetailsAsync: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MercadoPagoWebhookService>(MercadoPagoWebhookService);
    prisma = module.get<PrismaService>(PrismaService);
    mpService = module.get<MercadoPagoService>(MercadoPagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should do nothing if paymentId is missing', async () => {
    const payload = { data: {} } as MercadoPagoWebhookRequest;
    const result = await service.processWebhook(payload);
    expect(result).toBeUndefined();
  });

  it('should do nothing if payment status is in_process', async () => {
    const payload = { data: { id: '123' } } as MercadoPagoWebhookRequest;
    (mpService.getPaymentDetailsAsync as jest.Mock).mockResolvedValue({
      status: MercadoPagoPaymentStatus.InProcess,
    });
    const result = await service.processWebhook(payload);
    expect(result).toBeUndefined();
  });

  it('should throw error if orderId is missing', async () => {
    const payload = { data: { id: '123' } } as MercadoPagoWebhookRequest;
    (mpService.getPaymentDetailsAsync as jest.Mock).mockResolvedValue({
      status: MercadoPagoPaymentStatus.Approved,
      external_reference: null,
    });
    await expect(service.processWebhook(payload)).rejects.toThrow(
      'No orderId provided in Mercado Pago payment notification',
    );
  });

  it('should upsert payment and return orderId and paymentStatus', async () => {
    const payload = { data: { id: '123' } } as MercadoPagoWebhookRequest;
    (mpService.getPaymentDetailsAsync as jest.Mock).mockResolvedValue({
      id: '123',
      status: MercadoPagoPaymentStatus.Approved,
      transaction_amount: 100,
      currency_id: 'ARS',
      description: 'desc',
      payment_method_id: 'visa',
      payment_type_id: 'credit_card',
      date_created: '2024-06-30T00:00:00Z',
      date_approved: '2024-06-30T00:01:00Z',
      date_last_updated: '2024-06-30T00:02:00Z',
      external_reference: '456',
    });
    (prisma.payment.upsert as jest.Mock).mockResolvedValue({});

    const result = await service.processWebhook(payload);

    expect(prisma.payment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { mpPaymentId: '123' },
        create: expect.objectContaining({
          orderId: 456,
          statusId: expect.any(Number),
        }),
        update: expect.objectContaining({
          statusId: expect.any(Number),
        }),
      }),
    );
    expect(result).toEqual({
      orderId: 456,
      paymentStatus: MercadoPagoPaymentStatus.Approved,
    });
  });
});
