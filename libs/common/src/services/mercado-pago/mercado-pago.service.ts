import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';
import { PreferenceCreateData } from 'mercadopago/dist/clients/preference/create/types';

@Injectable()
export class MercadoPagoService {
  private readonly preference: Preference;
  private readonly payment: Payment;

  constructor(private readonly config: ConfigService) {
    const accessToken = this.config.get<string>('MP_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error('MercadoPago access token is not configured.');
    }

    const client = new MercadoPagoConfig({ accessToken });
    this.preference = new Preference(client);
    this.payment = new Payment(client);
  }

  async createPreference(
    preferenceCreateData: PreferenceCreateData,
  ): Promise<PreferenceResponse> {
    return this.preference.create(preferenceCreateData);
  }

  async getPaymentDetailsAsync(paymentId: string): Promise<PaymentResponse> {
    return this.payment.get({ id: paymentId });
  }
}
