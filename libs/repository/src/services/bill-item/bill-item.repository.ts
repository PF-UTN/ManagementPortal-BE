import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class BillItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createManyBillItemAsync(
    data: Prisma.BillItemCreateManyInput[],
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.billItem.createMany({
      data,
    });
  }
}
