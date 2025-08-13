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

  async findByPurchaseOrderIdAsync(orderId: number) {
    return this.prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId: orderId },
      include: { product: true },
    });
  }

  async deleteByPurchaseOrderIdAsync(
    orderId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.purchaseOrderItem.deleteMany({
      where: { purchaseOrderId: orderId },
    });
  }
}
