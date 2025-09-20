import { Injectable } from '@nestjs/common';

import { PaymentTypeRepository } from './../../../../libs/repository/src/services/payment-type/payment-type.repository';

@Injectable()
export class PaymentTypeService {
  constructor(private readonly paymentTypeRepository: PaymentTypeRepository) {}

  async findPaymentTypeByIdAsync(id: number) {
    return await this.paymentTypeRepository.findPaymentTypeByIdAsync(id);
  }
}
