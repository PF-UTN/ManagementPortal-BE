import { Query } from '@nestjs/cqrs';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

export class CheckoutOrderQuery extends Query<PreferenceResponse> {
  constructor(
    public orderId: number,
    public authorizationHeader: string,
  ) {
    super();
  }
}
