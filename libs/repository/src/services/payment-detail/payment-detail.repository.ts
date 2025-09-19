import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PaymentDetailDataDto } from '@mp/common/dtos';

import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentDetailRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPaymentDetailAsync(
    data: PaymentDetailDataDto,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.paymentDetail.create({ data });
  }
}
