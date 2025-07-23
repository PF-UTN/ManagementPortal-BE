import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class PurchaseOrderItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createManyPurchaseOrderItemAsync(
    data: Prisma.PurchaseOrderItemCreateManyInput[],
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.purchaseOrderItem.createMany({
      data,
    });
  }
}
