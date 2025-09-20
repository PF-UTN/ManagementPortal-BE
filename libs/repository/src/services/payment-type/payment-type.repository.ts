import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPaymentTypeByIdAsync(id: number) {
    return this.prisma.paymentType.findUnique({
      where: { id },
    });
  }
}
