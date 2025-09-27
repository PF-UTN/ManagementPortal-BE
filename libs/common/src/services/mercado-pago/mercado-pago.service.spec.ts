import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Preference } from 'mercadopago';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';
import { PreferenceCreateData } from 'mercadopago/dist/clients/preference/create/types';

import { MercadoPagoService } from './mercado-pago.service';

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(),
  Preference: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  })),
}));

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;
  let configService: ConfigService;
  let preferenceMock: jest.Mocked<Preference>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('fake_token'), // ✅ mock before constructor runs
          },
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    service = module.get<MercadoPagoService>(MercadoPagoService);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    preferenceMock = (service as any).preference;
  });

  describe('constructor', () => {
    it('should throw if MP_TEST_ACCESS_TOKEN is not set', () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce(undefined);
      expect(() => new MercadoPagoService(configService)).toThrowError(
        'MercadoPago access token is not configured.',
      );
    });

    it('should create MercadoPagoConfig and Preference if token exists', () => {
      expect(service).toBeDefined();
    });
  });

  describe('createPreference', () => {
    it('should call preference.create with correct data and return response', async () => {
      const data: PreferenceCreateData = {
        body: {
          items: [{ id: '1', title: 'Item 1', quantity: 1, unit_price: 100 }],
        },
      };
      const response = { id: '123', init_point: 'url' } as PreferenceResponse;

      jest.spyOn(preferenceMock, 'create').mockResolvedValue(response);

      const result = await service.createPreference(data);

      expect(preferenceMock.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(response);
    });

    it('should propagate errors from preference.create', async () => {
      const data: PreferenceCreateData = {
        body: {
          items: [{ id: '1', title: 'Item 1', quantity: 1, unit_price: 100 }],
        },
      };
      const error = new Error('Failed');

      jest.spyOn(preferenceMock, 'create').mockRejectedValue(error);

      await expect(service.createPreference(data)).rejects.toThrow(error);
    });
  });
});
