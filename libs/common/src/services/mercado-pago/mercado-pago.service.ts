import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';
import { PreferenceCreateData } from 'mercadopago/dist/clients/preference/create/types';

@Injectable()
export class MercadoPagoService {
  private readonly preference: Preference;

  constructor(private readonly config: ConfigService) {
    const accessToken = config.get<string>('MP_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error('MercadoPago access token is not configured.');
    }

    const client = new MercadoPagoConfig({ accessToken });
    this.preference = new Preference(client);
  }

  async createPreference(
    preferenceCreateData: PreferenceCreateData,
  ): Promise<PreferenceResponse> {
    return this.preference.create(preferenceCreateData);
  }
}
